package com.doot.backend.crypto;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Base64;
import java.util.logging.Logger;

@Component
@Slf4j
@Getter
public class ServerKeyHolder {
//    private static final Logger log = Logger.getLogger(ServerKeyHolder.class.getName());

    private KeyPair keyPair;

    @PostConstruct
    public  void init() throws Exception{
        KeyPairGenerator gen =KeyPairGenerator.getInstance("RSA");
        gen.initialize(2048);
        this.keyPair = gen.generateKeyPair();
        log.info("Server RSA keypair generated of 2048-bit. Public key:{}" ,
                getPublicKeyBase64().substring(0,32)+ "...");
    }

    public PublicKey getPublicKey(){
        return keyPair.getPublic();
    };
    public PrivateKey getPrivateKey(){
        return keyPair.getPrivate();
    };
    public String getPublicKeyBase64(){
        return java.util.Base64
                .getEncoder().encodeToString(keyPair.getPublic().getEncoded());
    }
}
