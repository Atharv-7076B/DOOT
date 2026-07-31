package com.doot.backend.Entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MeshPacket {

    private String packetId;//Unique packet identifier
    private int ttl;//It tells hops remaining
    private Instant createdAt;//Time when the packet it created
    private String cipherText;//Base64(RSA-encrypted AES key + AES-GCM ciphertext)
}
