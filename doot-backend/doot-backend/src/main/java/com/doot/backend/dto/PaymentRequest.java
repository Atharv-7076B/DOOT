package com.doot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {

    private String senderVpa;
    private String receiverVpa;
    private BigDecimal amount;
    private String pin;
    private int ttl;
}