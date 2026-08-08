package com.doot.backend.service.serviceImpl;

import com.doot.backend.crypto.HybridCryptoService;
import com.doot.backend.crypto.ServerKeyHolder;
import com.doot.backend.dto.PaymentRequest;
import com.doot.backend.entity.Account;
import com.doot.backend.entity.MeshPacket;
import com.doot.backend.entity.PaymentInstruction;
import com.doot.backend.exception.BalanceLessThanAmountException;
import com.doot.backend.service.AccountService;
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

    @Override
    public MeshPacket createPayment(PaymentRequest request) throws Exception {

        //Checked Sender and Receiver Account
        Account sender = accountService.getAccountByVpa(request.getSenderVpa());
        Account receiver = accountService.getAccountByVpa(request.getReceiverVpa());


        //Validate amount
        if(request.getAmount().compareTo(BigDecimal.ZERO)<=0){
            throw new Exception("Amount must be positive");
        }

        //Validate Balance
        if(sender.getBalance().compareTo(request.getAmount()) < 0){
            throw new BalanceLessThanAmountException("Sender balance is less than the amount to be sent");
        }

        //Payment Instruction is created
        PaymentInstruction paymentInstruction = new PaymentInstruction();
        paymentInstruction.setAmount(request.getAmount());
        paymentInstruction.setSenderVpa(request.getSenderVpa());
        paymentInstruction.setReceiverVpa(request.getReceiverVpa());
        paymentInstruction.setNonce(UUID.randomUUID().toString());
        paymentInstruction.setPinHash(hybridCryptoService.hashCipherText(request.getPin()));
        paymentInstruction.setSignedAt(Instant.now());

        //CipherText
        String cipherText = hybridCryptoService.encrypt(paymentInstruction,serverKeyHolder.getPublicKey());

        //MeshPacket
        MeshPacket meshPacket = new MeshPacket();
        meshPacket.setPacketId(UUID.randomUUID().toString());
        meshPacket.setTtl(request.getTtl());
        meshPacket.setCipherText(cipherText);
        meshPacket.setCreatedAt(Instant.now());

        return meshPacket;
    }
}
