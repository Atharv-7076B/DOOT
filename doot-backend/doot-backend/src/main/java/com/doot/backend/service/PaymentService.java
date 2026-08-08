package com.doot.backend.service;

import com.doot.backend.entity.MeshPacket;

public interface PaymentService {
    MeshPacket createPayment(PaymentRequest request) throws Exception;
}
