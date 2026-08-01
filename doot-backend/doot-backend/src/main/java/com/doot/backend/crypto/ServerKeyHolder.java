package com.doot.backend.crypto;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;

@Component
@Slf4j
@Getter
public class ServerKeyHolder {
//    private static final Logger log = Logger.getLogger(ServerKeyHolder.class.getName());

    private KeyPair keyPair;

    @PostConstruct//Post construct is automatically calls only one time when the bean is created and load into the IOC container
    public  void init() throws Exception{
        KeyPairGenerator gen =KeyPairGenerator.getInstance("RSA");//Gets the instance of the RSA

        gen.initialize(2048);//Key size - 2048(Standard key size is used)

        this.keyPair = gen.generateKeyPair();//Generate the public and private key

        log.info("Server RSA keypair generated of 2048-bit. Public key:{}" ,
                getPublicKeyBase64().substring(0,32)+ "...");//This is used to convert the binary values into the Text format.
    }

    public PublicKey getPublicKey(){
        return keyPair.getPublic();
    };
    public PrivateKey getPrivateKey(){
        return keyPair.getPrivate();
    };
    public String getPublicKeyBase64(){
        return java.util.Base64//As the keys are stores in binary format so this is used to convert into text format
                .getEncoder().encodeToString(keyPair.getPublic().getEncoded());
    }
}
