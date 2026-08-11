package com.doot.backend.service.serviceImpl;

import com.doot.backend.crypto.HybridCryptoService;
import com.doot.backend.entity.Account;
import com.doot.backend.entity.MeshPacket;
import com.doot.backend.entity.PaymentInstruction;
import com.doot.backend.service.AccountService;
import com.doot.backend.service.BridgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class BridgeServiceImpl implements BridgeService {

    private final RedisTemplate<String,String> redisTemplate;
    private final HybridCryptoService hybridCryptoService;
    private final AccountService accountService;

    @Override
    public void processPacket(MeshPacket packet) throws Exception {
        //Decrypt the packer
        PaymentInstruction paymentInstruction = hybridCryptoService.decrypt(packet.getCipherText());

        //Validate payment insturction
        long now = Instant.now().toEpochMilli();
        long maxAge =  24 * 60 * 60 * 1000L;//24 hrs in milisec
        long age = now - paymentInstruction.getSignedAt().toEpochMilli();


        if(age > maxAge || age < 0){
            throw new Exception("Payment instruction is expired or signedAt is in the future");
        }

        //Create the hash of the packet and store it in redis to avoid replay attacks
        String packetHash = hybridCryptoService.hashCipherText(packet.getCipherText());

        String key = "processed:" + packetHash;

        //Check replay attack
        Boolean alreadyProcessed = redisTemplate.hasKey(key);

        if(Boolean.TRUE.equals(alreadyProcessed)){
            throw new Exception("Packet has already been processed");
        }

        //Get the accounts
        Account sender = accountService.getAccountByVpa(paymentInstruction.getSenderVpa());
        Account receiver = accountService.getAccountByVpa(paymentInstruction.getReceiverVpa());


        //Debit and credit the accounts
        accountService.debitAccount(sender.getVpa(),paymentInstruction.getAmount());
        accountService.creditAccount(receiver.getVpa(),paymentInstruction.getAmount());

        //Mark the packet as processed
        redisTemplate.opsForValue().set(key,"processed",24,TimeUnit.HOURS);
    }
}
