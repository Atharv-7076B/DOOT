package com.doot.backend.configuration.schedular;

import com.doot.backend.service.MeshService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MeshSchedular {

    private final MeshService meshService;

    @Scheduled(fixedRate = 1000)
    public void processMeshPackets() {
        meshService.runGossipRound();
    }
}
