package com.doot.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {

    @JsonAlias({"sender", "senderVpa"})
    private String senderVpa;

    @JsonAlias({"receiver", "receiverVpa"})
    private String receiverVpa;

    private BigDecimal amount;
    private String pin;
    private int ttl;
}