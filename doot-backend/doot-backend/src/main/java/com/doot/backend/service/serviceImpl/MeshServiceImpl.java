package com.doot.backend.service.serviceImpl;

import com.doot.backend.entity.MeshPacket;
import com.doot.backend.service.MeshService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MeshServiceImpl implements MeshService {
    private final RedisTemplate<String,MeshPacket> redisTemplate;
    @Override
    public MeshPacket injectPacket(MeshPacket packet) {
        String key = "packet:"+packet.getPacketId();
        redisTemplate.opsForValue().set(key,packet);
        return packet;
    }

    //Add the demo neighbours to create mesh topology
    private final Map<String, List<String>> neighbors = Map.of(
            "A", List.of("B", "C"),
            "B", List.of("A", "C", "D"),
            "C", List.of("A", "B", "D"),
            "D", List.of("B", "C")
    );

    @Override
    public void gossip(MeshPacket packet, String currNode) {

        // Check TTL
        if (packet.getTtl() <= 0) {
            return;
        }

        // Check if this node has already seen this packet
        String seenKey =
                "seen:" + packet.getPacketId() + ":" + currNode;

        Boolean alreadySeen = redisTemplate.hasKey(seenKey);

        if (Boolean.TRUE.equals(alreadySeen)) {
            return;
        }

        // Mark packet as seen by this node
        redisTemplate.opsForValue().set(seenKey, packet);

        // Get neighbours
        List<String> nodeNeighbors = neighbors.get(currNode);

        if (nodeNeighbors == null || nodeNeighbors.isEmpty()) {
            return;
        }

        // Decrement TTL before forwarding
        packet.setTtl(packet.getTtl() - 1);

        // Forward packet
        for (String neighbor : nodeNeighbors) {

            System.out.println(
                    "Node " + currNode +
                            " gossiping packet " + packet.getPacketId() +
                            " to " + neighbor +
                            " | TTL: " + packet.getTtl()
            );

            String key =
                    "packet:" + packet.getPacketId() + ":" + neighbor;

            redisTemplate.opsForValue().set(key, packet);
        }
    }
}
