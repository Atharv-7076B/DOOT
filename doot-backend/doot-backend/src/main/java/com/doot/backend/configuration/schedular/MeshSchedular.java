package com.doot.backend.configuration.schedular;

import com.doot.backend.entity.MeshPacket;
import com.doot.backend.service.MeshService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class MeshSchedular {
    private final RedisTemplate<String, Object> redisTemplate;
    private final MeshService meshService;

    @Scheduled(fixedRate = 3000) //
    public void processMeshPackets(){
        Set<String> keys = redisTemplate.keys("packet:*");
        if(keys == null || keys.isEmpty()){
            return;
        }

        for(String key : keys){
            MeshPacket packet = (MeshPacket) redisTemplate.opsForValue().get(key);

            if(packet == null)
                return;

            meshService.gossip(packet,packet.getCurrentNode());

            redisTemplate.delete(key);//Remove the packet after processing
        }
    }
}
