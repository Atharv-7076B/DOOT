package com.doot.backend.service.serviceImpl;

import com.doot.backend.entity.MeshPacket;
import com.doot.backend.service.MeshService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

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

    @Override
    public void gossip() {

    }
}
