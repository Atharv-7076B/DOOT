package com.doot.backend.service.serviceImpl;

import com.doot.backend.entity.MeshPacket;
import com.doot.backend.service.BridgeService;
import com.doot.backend.service.MeshService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MeshServiceImpl implements MeshService {

    private final RedisTemplate<String, MeshPacket> redisTemplate;
    private final BridgeService bridgeService;

    // Demo mesh topology
    private final Map<String, List<String>> neighbors = Map.of(
            "A", List.of("B", "C"),
            "B", List.of("A", "C", "D"),
            "C", List.of("A", "B", "D"),
            "D", List.of("B", "C")
    );

    // For V1, D is the bridge node
    private static final String BRIDGE_NODE = "D";

    @Override
    public MeshPacket injectPacket(MeshPacket packet) {

        String key = "packet:" + packet.getPacketId();

        redisTemplate.opsForValue().set(key, packet);

        return packet;
    }

    @Override
    public void gossip(MeshPacket packet, String currNode) {

        // 1. Check TTL
        if (packet.getTtl() <= 0) {
            return;
        }

        // 2. Check if this node has already seen the packet
        String seenKey =
                "seen:" + packet.getPacketId() + ":" + currNode;

        Boolean alreadySeen = redisTemplate.hasKey(seenKey);

        if (Boolean.TRUE.equals(alreadySeen)) {
            return;
        }

        // 3. Mark packet as seen by this node
        redisTemplate.opsForValue().set(seenKey, packet);

        // 4. Check if current node is the bridge
        if (currNode.equals(BRIDGE_NODE)) {

            packet.setBridgeNodeId(currNode);

            System.out.println(
                    "Bridge Node " + currNode +
                            " received packet " + packet.getPacketId() +
                            " | Hops: " + packet.getHopCount()
            );

            try {
                bridgeService.processPacket(packet);
            } catch (Exception e) {
                System.out.println(
                        "Failed to process packet "
                                + packet.getPacketId()
                                + ": " + e.getMessage()
                );
            }

            return;
        }

        // 5. Get neighbours
        List<String> nodeNeighbors = neighbors.get(currNode);

        if (nodeNeighbors == null || nodeNeighbors.isEmpty()) {
            return;
        }

        // 6. Decrease TTL
        packet.setTtl(packet.getTtl() - 1);

        // 7. Increase hop count
        packet.setHopCount(packet.getHopCount() + 1);

        // 8. Forward packet to neighbours
        for (String neighbor : nodeNeighbors) {

            System.out.println(
                    "Node " + currNode +
                            " gossiping packet " + packet.getPacketId() +
                            " to " + neighbor +
                            " | TTL: " + packet.getTtl() +
                            " | Hops: " + packet.getHopCount()
            );

            String key =
                    "packet:" + packet.getPacketId() + ":" + neighbor;

            redisTemplate.opsForValue().set(key, packet);
        }
    }
}