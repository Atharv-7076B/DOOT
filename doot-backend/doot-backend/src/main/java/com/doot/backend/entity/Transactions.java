package com.doot.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.doot.backend.enums.Status;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Transactions {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    @Column(nullable = false,unique = true,length = 64)
    private String packetHash;//Sha 256 hex of the encrypted packet


    @Column(nullable = false)
    private String senderVpa;

    @Column(nullable = false)
    private String receiverVpa;


    @Column(nullable = false,precision = 19,scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private Instant signedAt;//Time at which the sender signed it

    @Column(nullable = false)
    private Instant settledAt;//When the backend actually process it

    @Column(nullable = false)
    private String bridgeNodeId;//Which mesh node finnally delivered it

    @Column(nullable = false)
    private int hopCount;//How many devices it passes through


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @JsonProperty("id")
    public Long getId() {
        return transactionId;
    }

    @JsonProperty("sender")
    public String getSender() {
        return senderVpa;
    }

    @JsonProperty("receiver")
    public String getReceiver() {
        return receiverVpa;
    }
}
