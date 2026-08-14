package com.doot.backend.service.serviceImpl;

import com.doot.backend.crypto.HybridCryptoService;
import com.doot.backend.entity.Account;
import com.doot.backend.entity.MeshPacket;
import com.doot.backend.entity.PaymentInstruction;
import com.doot.backend.entity.Transactions;
import com.doot.backend.enums.Status;
import com.doot.backend.repository.TransactionRepository;
import com.doot.backend.service.AccountService;
import com.doot.backend.service.BridgeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class BridgeServiceImpl implements BridgeService {
    private final TransactionRepository transactionRepository;
    private final RedisTemplate<String,String> redisTemplate;
    private final HybridCryptoService hybridCryptoService;
    private final AccountService accountService;

    private final Set<String> inMemoryProcessedSet = ConcurrentHashMap.newKeySet();

    @Override
    @Transactional
    public void processPacket(MeshPacket packet) throws Exception {
        PaymentInstruction paymentInstruction = hybridCryptoService.decrypt(packet.getCipherText());

        long now = Instant.now().toEpochMilli();
        long maxAge = 24 * 60 * 60 * 1000L;
        long age = now - paymentInstruction.getSignedAt().toEpochMilli();

        if (age > maxAge || age < 0) {
            throw new IllegalArgumentException("Payment instruction is expired or signedAt is in the future");
        }

        String packetHash = hybridCryptoService.hashCipherText(packet.getCipherText());

        // Replay check via DB and Redis/in-memory
        if (transactionRepository.existsByPacketHash(packetHash) || inMemoryProcessedSet.contains(packetHash)) {
            throw new IllegalArgumentException("Packet has already been processed");
        }

        String key = "processed:" + packetHash;
        try {
            Boolean alreadyProcessed = redisTemplate.hasKey(key);
            if (Boolean.TRUE.equals(alreadyProcessed)) {
                throw new IllegalArgumentException("Packet has already been processed");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.debug("Redis unavailable for replay check");
        }

        Account sender = accountService.getAccountByVpa(paymentInstruction.getSenderVpa());
        Account receiver = accountService.getAccountByVpa(paymentInstruction.getReceiverVpa());

        accountService.debitAccount(sender.getVpa(), paymentInstruction.getAmount());
        accountService.creditAccount(receiver.getVpa(), paymentInstruction.getAmount());

        Transactions settledTransaction = new Transactions();
        settledTransaction.setBridgeNodeId(packet.getBridgeNodeId() != null ? packet.getBridgeNodeId() : "bridge");
        settledTransaction.setPacketHash(packetHash);
        settledTransaction.setSettledAt(Instant.now());
        settledTransaction.setSenderVpa(paymentInstruction.getSenderVpa());
        settledTransaction.setReceiverVpa(paymentInstruction.getReceiverVpa());
        settledTransaction.setAmount(paymentInstruction.getAmount());
        settledTransaction.setHopCount(packet.getHopCount());
        settledTransaction.setSignedAt(paymentInstruction.getSignedAt());
        settledTransaction.setStatus(Status.SETTLED);
        transactionRepository.save(settledTransaction);

        inMemoryProcessedSet.add(packetHash);
        try {
            redisTemplate.opsForValue().set(key, "processed", 24, TimeUnit.HOURS);
        } catch (Exception e) {
            log.debug("Redis unavailable for marking processed");
        }
    }
}
