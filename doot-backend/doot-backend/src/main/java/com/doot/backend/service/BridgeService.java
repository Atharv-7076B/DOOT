package com.doot.backend.service;

import com.doot.backend.entity.MeshPacket;

public interface BridgeService {
    void processPacket(MeshPacket packet) throws Exception;
}
