package com.doot.backend.service.serviceImpl;

import com.doot.backend.crypto.HybridCryptoService;
import com.doot.backend.dto.PacketExplorerDto;
import com.doot.backend.dto.VirtualDeviceDto;
import com.doot.backend.entity.MeshPacket;
import com.doot.backend.repository.TransactionRepository;
import com.doot.backend.service.BridgeService;
import com.doot.backend.service.MeshService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MeshServiceImpl implements MeshService {

    private final RedisTemplate<String, MeshPacket> redisTemplate;
    private final BridgeService bridgeService;
    private final HybridCryptoService hybridCryptoService;
    private final TransactionRepository transactionRepository;

    private static final String ACTIVE_PACKETS_SET = "active_packet_ids";

    // In-memory tracking & fallbacks
    private final Map<String, MeshPacket> inMemoryPackets = new ConcurrentHashMap<>();
    private final Map<String, MeshPacket> allTrackedPackets = new ConcurrentHashMap<>();
    private final Set<String> inMemoryActiveSet = ConcurrentHashMap.newKeySet();
    private final Set<String> inMemorySeenSet = ConcurrentHashMap.newKeySet();
    private final Map<String, Map<String, Object>> inMemoryStatusMap = new ConcurrentHashMap<>();

    // Topology mapping: alice (A), bob (B), charlie (C), bridge (D)
    private final Map<String, List<String>> neighbors = Map.of(
            "alice", List.of("bob", "charlie"),
            "bob", List.of("bridge", "charlie", "alice"),
            "charlie", List.of("bridge", "bob", "alice"),
            "bridge", List.of("bob", "charlie"),
            "A", List.of("B", "C"),
            "B", List.of("D", "C", "A"),
            "C", List.of("D", "B", "A"),
            "D", List.of("B", "C")
    );

    private String normalizeNode(String node) {
        if (node == null) return "alice";
        String lower = node.toLowerCase().trim();
        if (lower.equals("a") || lower.equals("alice")) return "alice";
        if (lower.equals("b") || lower.equals("bob")) return "bob";
        if (lower.equals("c") || lower.equals("charlie")) return "charlie";
        if (lower.equals("d") || lower.equals("bridge")) return "bridge";
        return lower;
    }

    private boolean isBridgeNode(String node) {
        String normalized = normalizeNode(node);
        return "bridge".equals(normalized) || "d".equals(normalized);
    }

    @Override
    public MeshPacket injectPacket(MeshPacket packet) {
        if (packet.getCurrentNode() == null) {
            packet.setCurrentNode("alice");
        } else {
            packet.setCurrentNode(normalizeNode(packet.getCurrentNode()));
        }

        if (packet.getVisitedNodes() == null) {
            packet.setVisitedNodes(new ArrayList<>());
        }
        if (packet.getVisitedNodes().isEmpty() || !packet.getVisitedNodes().contains(packet.getCurrentNode())) {
            packet.getVisitedNodes().add(packet.getCurrentNode());
        }

        String packetId = packet.getPacketId();
        String key = "packet:" + packetId;

        inMemoryPackets.put(packetId, packet);
        allTrackedPackets.put(packetId, packet);
        inMemoryActiveSet.add(packetId);

        try {
            redisTemplate.opsForValue().set(key, packet);
            redisTemplate.opsForSet().add(ACTIVE_PACKETS_SET, packet);
        } catch (Exception e) {
            log.debug("Redis unavailable, stored in memory: {}", e.getMessage());
        }

        setPaymentStatus(packetId, "IN_MESH", false, null);
        log.info("Injected packet {} into node {}", packetId, packet.getCurrentNode());
        return packet;
    }

    @Override
    public void gossip(MeshPacket packet, String currNode) {
        if (packet == null || packet.getPacketId() == null) return;
        String packetId = packet.getPacketId();
        String currentNode = normalizeNode(currNode != null ? currNode : packet.getCurrentNode());

        // 1. Check TTL
        if (packet.getTtl() <= 0) {
            log.info("Packet {} expired (TTL <= 0). Cleaning up.", packetId);
            removePacket(packetId);
            setPaymentStatus(packetId, "EXPIRED", true, "Packet TTL expired in mesh");
            return;
        }

        // 2. Check seen key to prevent loops
        String seenKey = "seen:" + packetId + ":" + currentNode;
        boolean alreadySeen = inMemorySeenSet.contains(seenKey);
        try {
            Boolean redisSeen = redisTemplate.hasKey(seenKey);
            if (Boolean.TRUE.equals(redisSeen)) alreadySeen = true;
        } catch (Exception e) {
            // Redis fallback
        }

        if (alreadySeen) {
            log.debug("Node {} already saw packet {}", currentNode, packetId);
            return;
        }

        // 3. Mark as seen
        inMemorySeenSet.add(seenKey);
        try {
            redisTemplate.opsForValue().set(seenKey, packet, 24, TimeUnit.HOURS);
        } catch (Exception e) {
            // Redis fallback
        }

        // 4. If current node is Bridge, attempt settlement
        if (isBridgeNode(currentNode)) {
            packet.setBridgeNodeId(currentNode);
            log.info("Bridge Node {} received packet {} | Hops: {}", currentNode, packetId, packet.getHopCount());

            try {
                bridgeService.processPacket(packet);
                removePacket(packetId);
                setPaymentStatus(packetId, "SETTLED", true, null);
                log.info("Packet {} successfully settled at bridge", packetId);
            } catch (Exception e) {
                setPaymentStatus(packetId, "ERROR", true, e.getMessage());
                log.error("Failed to process packet {} at bridge: {}", packetId, e.getMessage());
            }
            return;
        }

        // 5. Get neighbors and select next hop
        List<String> nodeNeighbors = neighbors.get(currentNode);
        if (nodeNeighbors == null || nodeNeighbors.isEmpty()) {
            return;
        }

        // Select neighbor (prefer unseen or next in list)
        String nextHop = nodeNeighbors.get(0);
        for (String neighbor : nodeNeighbors) {
            String neighborSeenKey = "seen:" + packetId + ":" + neighbor;
            boolean neighborSeen = inMemorySeenSet.contains(neighborSeenKey);
            try {
                Boolean rSeen = redisTemplate.hasKey(neighborSeenKey);
                if (Boolean.TRUE.equals(rSeen)) neighborSeen = true;
            } catch (Exception e) {
                // Redis fallback
            }
            if (!neighborSeen) {
                nextHop = neighbor;
                break;
            }
        }

        // 6. Update TTL, Hop Count, Current Node
        packet.setTtl(packet.getTtl() - 1);
        packet.setHopCount(packet.getHopCount() + 1);
        packet.setCurrentNode(nextHop);

        if (packet.getVisitedNodes() == null) {
            packet.setVisitedNodes(new ArrayList<>());
        }
        if (!packet.getVisitedNodes().contains(nextHop)) {
            packet.getVisitedNodes().add(nextHop);
        }

        String stage = isBridgeNode(nextHop) ? "BRIDGED" : "RELAYING";
        setPaymentStatus(packetId, stage, false, null);

        log.info("Node {} gossiping packet {} -> {} | TTL: {} | Hops: {}",
                currentNode, packetId, nextHop, packet.getTtl(), packet.getHopCount());

        inMemoryPackets.put(packetId, packet);
        allTrackedPackets.put(packetId, packet);
        String key = "packet:" + packetId;
        try {
            redisTemplate.opsForValue().set(key, packet);
        } catch (Exception e) {
            // Redis fallback
        }
    }

    @Override
    public MeshPacket getPacket(String packetId) {
        if (packetId == null) return null;
        try {
            MeshPacket packet = redisTemplate.opsForValue().get("packet:" + packetId);
            if (packet != null) return packet;
        } catch (Exception e) {
            // Redis fallback
        }
        return inMemoryPackets.get(packetId);
    }

    @Override
    public void setPaymentStatus(String packetId, String stage, boolean completed, String errorMessage) {
        if (packetId == null) return;
        MeshPacket activePacket = getPacket(packetId);
        Map<String, Object> statusMap = new HashMap<>();
        statusMap.put("packetId", packetId);
        statusMap.put("stage", stage);
        statusMap.put("completed", completed);
        statusMap.put("errorMessage", errorMessage);
        if (activePacket != null) {
            statusMap.put("currentNode", activePacket.getCurrentNode());
            statusMap.put("hopCount", activePacket.getHopCount());
            statusMap.put("ttl", activePacket.getTtl());
        }
        inMemoryStatusMap.put(packetId, statusMap);
    }

    @Override
    public Map<String, Object> getPaymentStatus(String packetId) {
        if (packetId == null) return Map.of("stage", "UNKNOWN", "completed", true);
        Map<String, Object> cached = inMemoryStatusMap.get(packetId);
        if (cached != null) {
            MeshPacket active = getPacket(packetId);
            if (active != null) {
                Map<String, Object> live = new HashMap<>(cached);
                live.put("currentNode", active.getCurrentNode());
                live.put("hopCount", active.getHopCount());
                live.put("ttl", active.getTtl());
                return live;
            }
            return cached;
        }
        MeshPacket active = getPacket(packetId);
        if (active != null) {
            String stage = isBridgeNode(active.getCurrentNode()) ? "BRIDGED" : (active.getHopCount() > 0 ? "RELAYING" : "IN_MESH");
            return Map.of(
                    "packetId", packetId,
                    "stage", stage,
                    "completed", false,
                    "currentNode", active.getCurrentNode(),
                    "hopCount", active.getHopCount(),
                    "ttl", active.getTtl()
            );
        }
        return Map.of("packetId", packetId, "stage", "SETTLED", "completed", true);
    }

    @Override
    public List<VirtualDeviceDto> getMeshState() {
        Map<String, List<MeshPacket>> devicePacketsMap = new LinkedHashMap<>();
        devicePacketsMap.put("alice", new ArrayList<>());
        devicePacketsMap.put("bob", new ArrayList<>());
        devicePacketsMap.put("charlie", new ArrayList<>());
        devicePacketsMap.put("bridge", new ArrayList<>());

        List<MeshPacket> allPackets = getAllActivePackets();
        for (MeshPacket packet : allPackets) {
            String normalizedNode = normalizeNode(packet.getCurrentNode());
            if (devicePacketsMap.containsKey(normalizedNode)) {
                devicePacketsMap.get(normalizedNode).add(packet);
            }
        }

        List<VirtualDeviceDto> result = new ArrayList<>();
        result.add(new VirtualDeviceDto("alice", "Alice", "alice@doot", true, false, false, new BigDecimal("4200.00"), List.of("bob", "charlie"), devicePacketsMap.get("alice")));
        result.add(new VirtualDeviceDto("bob", "Bob", "bob@doot", true, false, false, new BigDecimal("3150.00"), List.of("bridge", "charlie", "alice"), devicePacketsMap.get("bob")));
        result.add(new VirtualDeviceDto("charlie", "Charlie", "charlie@doot", true, false, false, new BigDecimal("1875.00"), List.of("bridge", "bob", "alice"), devicePacketsMap.get("charlie")));
        result.add(new VirtualDeviceDto("bridge", "Bridge", "bridge@doot", true, true, true, new BigDecimal("0.00"), List.of("bob", "charlie"), devicePacketsMap.get("bridge")));

        return result;
    }

    @Override
    public void runGossipRound() {
        List<MeshPacket> packets = getAllActivePackets();
        for (MeshPacket packet : packets) {
            gossip(packet, packet.getCurrentNode());
        }
    }

    @Override
    public void flushBridges() {
        List<MeshPacket> packets = getAllActivePackets();
        for (MeshPacket packet : packets) {
            if (isBridgeNode(packet.getCurrentNode())) {
                try {
                    packet.setBridgeNodeId(normalizeNode(packet.getCurrentNode()));
                    bridgeService.processPacket(packet);
                    removePacket(packet.getPacketId());
                    setPaymentStatus(packet.getPacketId(), "SETTLED", true, null);
                } catch (Exception e) {
                    setPaymentStatus(packet.getPacketId(), "ERROR", true, e.getMessage());
                    log.error("Failed to flush packet {} at bridge: {}", packet.getPacketId(), e.getMessage());
                }
            }
        }
    }

    @Override
    public void resetMesh() {
        List<MeshPacket> packets = getAllActivePackets();
        for (MeshPacket packet : packets) {
            removePacket(packet.getPacketId());
        }
        inMemoryPackets.clear();
        allTrackedPackets.clear();
        inMemoryActiveSet.clear();
        inMemorySeenSet.clear();

        try {
            redisTemplate.delete(ACTIVE_PACKETS_SET);
        } catch (Exception e) {
            // Redis fallback
        }
    }

    @Override
    public List<PacketExplorerDto> getPacketExplorerList() {
        Map<String, MeshPacket> combined = new LinkedHashMap<>();

        // 1. Add active packets
        List<MeshPacket> activePackets = getAllActivePackets();
        for (MeshPacket p : activePackets) {
            if (p != null && p.getPacketId() != null) {
                combined.put(p.getPacketId(), p);
                allTrackedPackets.put(p.getPacketId(), p);
            }
        }

        // 2. Include all tracked packets (including historical / settled)
        for (Map.Entry<String, MeshPacket> entry : allTrackedPackets.entrySet()) {
            if (!combined.containsKey(entry.getKey())) {
                combined.put(entry.getKey(), entry.getValue());
            }
        }

        List<PacketExplorerDto> dtos = new ArrayList<>();
        for (MeshPacket packet : combined.values()) {
            PacketExplorerDto dto = buildPacketExplorerDto(packet);
            if (dto != null) {
                dtos.add(dto);
            }
        }

        // Sort descending by createdAt
        dtos.sort((a, b) -> {
            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        return dtos;
    }

    @Override
    public PacketExplorerDto getPacketExplorerDetails(String packetId) {
        if (packetId == null) return null;
        MeshPacket packet = getPacket(packetId);
        if (packet == null) {
            packet = allTrackedPackets.get(packetId);
        }
        if (packet == null) return null;
        return buildPacketExplorerDto(packet);
    }

    private PacketExplorerDto buildPacketExplorerDto(MeshPacket packet) {
        if (packet == null || packet.getPacketId() == null) return null;

        String packetId = packet.getPacketId();
        String currentNode = packet.getCurrentNode() != null ? packet.getCurrentNode() : "alice";
        int ttl = packet.getTtl();
        int hopCount = packet.getHopCount();
        String bridgeNodeId = packet.getBridgeNodeId();
        Instant createdAt = packet.getCreatedAt() != null ? packet.getCreatedAt() : Instant.now();
        List<String> visitedNodes = packet.getVisitedNodes() != null ? new ArrayList<>(packet.getVisitedNodes()) : new ArrayList<>();
        String ciphertext = packet.getCipherText();

        // 1. Calculate Packet Hash
        String packetHash = "unknown";
        if (ciphertext != null && hybridCryptoService != null) {
            try {
                packetHash = hybridCryptoService.hashCipherText(ciphertext);
            } catch (Exception e) {
                log.debug("Error hashing ciphertext for packet {}", packetId, e);
            }
        }

        // 2. Status & Lifecycle Step
        Map<String, Object> statusMap = getPaymentStatus(packetId);
        String stageStr = statusMap != null ? (String) statusMap.get("stage") : "UNKNOWN";

        boolean isSettled = "SETTLED".equalsIgnoreCase(stageStr) ||
                (transactionRepository != null && !packetHash.equals("unknown") && transactionRepository.existsByPacketHash(packetHash));

        String status;
        int lifecycleStep;

        if (isSettled) {
            status = "SETTLED";
            lifecycleStep = 7;
        } else if ("EXPIRED".equalsIgnoreCase(stageStr) || ttl <= 0) {
            status = "EXPIRED";
            lifecycleStep = 4;
        } else if ("ERROR".equalsIgnoreCase(stageStr)) {
            status = "ERROR";
            lifecycleStep = 4;
        } else if (isBridgeNode(currentNode) || bridgeNodeId != null) {
            status = "BRIDGED";
            lifecycleStep = 5;
        } else if (hopCount > 0) {
            status = "RELAYING";
            lifecycleStep = 4;
        } else {
            status = "IN_MESH";
            lifecycleStep = 3;
        }

        List<String> lifecycleStages = List.of(
                "Created",
                "Encrypted",
                "Injected",
                "In Mesh",
                "Bridge Received",
                "Decrypted & Validated",
                "Settled"
        );

        // 3. Security Info
        String replayProtectionStatus;
        if (isSettled) {
            replayProtectionStatus = "SETTLED & REPLAY PROTECTED";
        } else {
            replayProtectionStatus = "ACTIVE (Monitoring Replays)";
        }

        // 4. Redis State
        String redisPacketKey = "packet:" + packetId;
        boolean inRedis = false;
        try {
            if (redisTemplate != null && Boolean.TRUE.equals(redisTemplate.hasKey(redisPacketKey))) {
                inRedis = true;
            }
        } catch (Exception ignored) {}
        if (inMemoryPackets.containsKey(packetId)) {
            inRedis = true;
        }

        List<String> knownNodes = List.of("alice", "bob", "charlie", "bridge");
        List<String> seenNodes = new ArrayList<>();
        for (String node : knownNodes) {
            String seenKey = "seen:" + packetId + ":" + node;
            boolean seen = inMemorySeenSet.contains(seenKey);
            try {
                if (redisTemplate != null && Boolean.TRUE.equals(redisTemplate.hasKey(seenKey))) {
                    seen = true;
                }
            } catch (Exception ignored) {}
            if (seen) {
                seenNodes.add(node);
            }
        }

        String processedKey = "processed:" + packetHash;
        boolean processedInRedis = isSettled;

        return PacketExplorerDto.builder()
                .packetId(packetId)
                .status(status)
                .currentNode(currentNode)
                .ttl(ttl)
                .hopCount(hopCount)
                .bridgeNodeId(bridgeNodeId)
                .createdAt(createdAt)
                .visitedNodes(visitedNodes)
                .encryption("AES-256-GCM")
                .keyWrapping("RSA-2048 OAEP")
                .replayProtectionStatus(replayProtectionStatus)
                .ciphertext(ciphertext)
                .packetHash(packetHash)
                .pinExposed(false)
                .lifecycleStep(lifecycleStep)
                .lifecycleStages(lifecycleStages)
                .redisPacketKey(redisPacketKey)
                .inRedis(inRedis)
                .seenNodes(seenNodes)
                .processedKey(processedKey)
                .processedInRedis(processedInRedis)
                .build();
    }

    private List<MeshPacket> getAllActivePackets() {
        Map<String, MeshPacket> combinedMap = new HashMap<>(inMemoryPackets);

        try {
            Set<MeshPacket> packetsSet = redisTemplate.opsForSet().members(ACTIVE_PACKETS_SET);
            if (packetsSet != null) {
                for (MeshPacket p : packetsSet) {
                    if (p != null && p.getPacketId() != null) {
                        MeshPacket currentCopy = redisTemplate.opsForValue().get("packet:" + p.getPacketId());
                        if (currentCopy != null) {
                            combinedMap.put(currentCopy.getPacketId(), currentCopy);
                        } else {
                            combinedMap.put(p.getPacketId(), p);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Redis unavailable, using in-memory active set");
        }

        return new ArrayList<>(combinedMap.values());
    }

    private void removePacket(String packetId) {
        inMemoryPackets.remove(packetId);
        inMemoryActiveSet.remove(packetId);

        String key = "packet:" + packetId;
        try {
            MeshPacket currentCopy = redisTemplate.opsForValue().get(key);
            if (currentCopy != null) {
                redisTemplate.opsForSet().remove(ACTIVE_PACKETS_SET, currentCopy);
            }
            redisTemplate.delete(key);
        } catch (Exception e) {
            // Redis fallback
        }
    }
}