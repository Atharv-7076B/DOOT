package com.doot.backend.service;
import com.doot.backend.entity.MeshPacket;

public interface MeshService {

    MeshPacket injectPacket(MeshPacket packet);

    void gossip();

}
