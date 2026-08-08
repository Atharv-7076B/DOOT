package com.doot.backend.service.serviceImpl;

import com.doot.backend.entity.MeshPacket;
import com.doot.backend.service.PaymentService;
import org.springframework.stereotype.Service;

@Service
public class PaymentServiceImpl implements PaymentService {
    @Override
    public MeshPacket createPayment(MeshPacket payment) {
        MeshPacket meshPacket = new MeshPacket();
        meshPacket.setPacketId(payment.getPacketId());
        meshPacket.setTtl(payment.getTtl());
        meshPacket.setCipherText(payment.getCipherText());
        meshPacket.setCreatedAt(payment.getCreatedAt());
        return meshPacket;
    }
}
