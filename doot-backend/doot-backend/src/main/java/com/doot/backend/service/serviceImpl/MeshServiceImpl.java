package com.doot.backend.service.serviceImpl;

import com.doot.backend.dto.VirtualDeviceDto;
import com.doot.backend.entity.MeshPacket;
import com.doot.backend.service.BridgeService;
import com.doot.backend.service.MeshService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MeshServiceImpl implements MeshService {

    private final RedisTemplate<String, MeshPacket> redisTemplate;
    private final BridgeService bridgeService;

    private static final String ACTIVE_PACKETS_SET = "active_packet_ids";

    // In-memory fallback if local Redis server is not running
    private final Map<String, MeshPacket> inMemoryPackets = new ConcurrentHashMap<>();
    private final Set<String> inMemoryActiveSet = ConcurrentHashMap.newKeySet();
    private final Set<String> inMemorySeenSet = ConcurrentHashMap.newKeySet();

    // Topology mapping: alice (A), bob (B), charlie (C), bridge (D)
    private final Map<String, List<String>> neighbors = Map.of(
            "alice", List.of("bob", "charlie"),
            "bob", List.of("alice", "charlie", "bridge"),
            "charlie", List.of("alice", "bob", "bridge"),
            "bridge", List.of("bob", "charlie"),
            "A", List.of("B", "C"),
            "B", List.of("A", "C", "D"),
            "C", List.of("A", "B", "D"),
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

        String packetId = packet.getPacketId();
        String key = "packet:" + packetId;

        inMemoryPackets.put(packetId, packet);
        inMemoryActiveSet.add(packetId);

        try {
            redisTemplate.opsForValue().set(key, packet);
            redisTemplate.opsForSet().add(ACTIVE_PACKETS_SET, packet);
        } catch (Exception e) {
            log.debug("Redis unavailable, stored in memory: {}", e.getMessage());
        }

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
                log.info("Packet {} successfully settled at bridge", packetId);
            } catch (Exception e) {
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

        log.info("Node {} gossiping packet {} -> {} | TTL: {} | Hops: {}",
                currentNode, packetId, nextHop, packet.getTtl(), packet.getHopCount());

        inMemoryPackets.put(packetId, packet);
        String key = "packet:" + packetId;
        try {
            redisTemplate.opsForValue().set(key, packet);
        } catch (Exception e) {
            // Redis fallback
        }
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
        result.add(new VirtualDeviceDto("alice", false, devicePacketsMap.get("alice")));
        result.add(new VirtualDeviceDto("bob", false, devicePacketsMap.get("bob")));
        result.add(new VirtualDeviceDto("charlie", false, devicePacketsMap.get("charlie")));
        result.add(new VirtualDeviceDto("bridge", true, devicePacketsMap.get("bridge")));

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
                } catch (Exception e) {
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
        inMemoryActiveSet.clear();
        inMemorySeenSet.clear();

        try {
            redisTemplate.delete(ACTIVE_PACKETS_SET);
        } catch (Exception e) {
            // Redis fallback
        }
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