package com.doot.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MeshPacket {

    private String packetId;//Unique packet identifier
    private int ttl;//It tells hops remaining
    private Instant createdAt;//Time when the packet it created
    @JsonProperty("ciphertext")
    private String cipherText;//Base64(RSA-encrypted AES key + AES-GCM ciphertext)
    private int hopCount;
    private String bridgeNodeId;
    private String currentNode;
    private List<String> visitedNodes = new ArrayList<>();
}

