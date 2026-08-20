package com.doot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PacketExplorerDto {

    // 1. Packet List & Details
    private String packetId;
    private String status; // IN_MESH, RELAYING, BRIDGED, SETTLED, EXPIRED, ERROR
    private String currentNode;
    private int ttl;
    private int hopCount;
    private String bridgeNodeId;
    private Instant createdAt;
    private List<String> visitedNodes;

    // 2. Security Information
    private String encryption;
    private String keyWrapping;
    private String replayProtectionStatus;
    private String ciphertext;
    private String packetHash;
    private boolean pinExposed;

    // 3. Packet Lifecycle (7 Steps)
    private int lifecycleStep;
    private List<String> lifecycleStages;

    // 4. Redis / Transport State
    private String redisPacketKey;
    private boolean inRedis;
    private List<String> seenNodes;
    private String processedKey;
    private boolean processedInRedis;
}
