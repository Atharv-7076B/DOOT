package com.doot.backend.service;

import com.doot.backend.dto.VirtualDeviceDto;
import com.doot.backend.entity.MeshPacket;

import java.util.List;

public interface MeshService {

    MeshPacket injectPacket(MeshPacket packet);

    void gossip(MeshPacket packet, String currNode);

    List<VirtualDeviceDto> getMeshState();

    void runGossipRound();

    void flushBridges();

    void resetMesh();
}
