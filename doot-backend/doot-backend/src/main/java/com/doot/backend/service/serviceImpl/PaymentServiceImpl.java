package com.doot.backend.service.serviceImpl;

import com.doot.backend.crypto.HybridCryptoService;
import com.doot.backend.crypto.ServerKeyHolder;
import com.doot.backend.dto.PaymentRequest;
import com.doot.backend.entity.Account;
import com.doot.backend.entity.MeshPacket;
import com.doot.backend.entity.PaymentInstruction;
import com.doot.backend.exception.BalanceLessThanAmountException;
import com.doot.backend.service.AccountService;
import com.doot.backend.service.MeshService;
import com.doot.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final AccountService accountService;
    private final ServerKeyHolder serverKeyHolder;
    private final HybridCryptoService hybridCryptoService;
    private final MeshService meshService;

    @Override
    public MeshPacket createPayment(PaymentRequest request) throws Exception {

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        String senderVpa = resolveVpa(request.getSenderVpa());
        String receiverVpa = resolveVpa(request.getReceiverVpa());

        Account sender = accountService.getAccountByVpa(senderVpa);
        Account receiver = accountService.getAccountByVpa(receiverVpa);

        if (sender.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BalanceLessThanAmountException("Sender balance is less than the amount to be sent");
        }

        PaymentInstruction paymentInstruction = new PaymentInstruction();
        paymentInstruction.setAmount(request.getAmount());
        paymentInstruction.setSenderVpa(senderVpa);
        paymentInstruction.setReceiverVpa(receiverVpa);
        paymentInstruction.setNonce(UUID.randomUUID().toString());
        paymentInstruction.setPinHash(hybridCryptoService.hashCipherText(request.getPin() != null ? request.getPin() : "1234"));
        paymentInstruction.setSignedAt(Instant.now());

        String cipherText = hybridCryptoService.encrypt(paymentInstruction, serverKeyHolder.getPublicKey());

        int ttl = request.getTtl() > 0 ? request.getTtl() : 5;

        MeshPacket meshPacket = new MeshPacket();
        meshPacket.setPacketId("pk-" + UUID.randomUUID().toString().substring(0, 8));
        meshPacket.setTtl(ttl);
        meshPacket.setCipherText(cipherText);
        meshPacket.setCreatedAt(Instant.now());
        meshPacket.setCurrentNode(nodeForVpa(senderVpa));
        return meshService.injectPacket(meshPacket);
    }

    private String resolveVpa(String input) {
        if (input == null) return "alice@doot";
        String trimmed = input.trim();
        if (trimmed.contains("@")) return trimmed;
        return trimmed.toLowerCase() + "@doot";
    }

    private String nodeForVpa(String vpa) {
        if (vpa == null) return "alice";
        String lower = vpa.toLowerCase();
        if (lower.startsWith("bob")) return "bob";
        if (lower.startsWith("charlie")) return "charlie";
        return "alice";
    }
}
