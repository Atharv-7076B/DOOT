package com.doot.backend.crypto;

import com.doot.backend.entity.PaymentInstruction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.spec.MGF1ParameterSpec;
import java.util.Base64;

@Service
public class HybridCryptoService {

    private static final String RSA_TRANSFORMATION = "RSA/ECB/OAEPWithSHA-256AndMGF1Padding";
    private static final String AES_TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int AES_KEY_BITS = 256;
    private static final int GCM_IV_BYTES = 12;
    private static final int GCM_TAG_BITS = 128;
    private static final int RSA_ENCRYPTED_KEY_BYTES = 256; // for 2048-bit RSA

    private final SecureRandom rng = new SecureRandom();
    private final ObjectMapper json = new ObjectMapper();

    @Autowired
    private ServerKeyHolder serverKeyHolder;

    public String encrypt(PaymentInstruction paymentInstruction, PublicKey serverPublicKey) throws Exception{
        byte[]plainText =json.writeValueAsBytes(paymentInstruction);

        //1.Create the AES Key

        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(AES_KEY_BITS);
        SecretKey aesKey = keyGen.generateKey();

        //2.AES-GCM encrypts the payload
        byte[] iv = new byte[GCM_IV_BYTES];
        rng.nextBytes(iv);
        Cipher aes = Cipher.getInstance(AES_TRANSFORMATION);
        aes.init(Cipher.ENCRYPT_MODE,aesKey,new GCMParameterSpec(GCM_TAG_BITS,iv));
        byte[] aesCipherText = aes.doFinal(plainText);

        // 3. RSA-OAEP encrypt the AES key with the server's public key.
        Cipher rsa =Cipher.getInstance(RSA_TRANSFORMATION);
        OAEPParameterSpec oeap = new OAEPParameterSpec(
"SHA-256","MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT);
        rsa.init(Cipher.ENCRYPT_MODE,serverPublicKey,oeap);
        byte [] encryptedAesKey = rsa.doFinal(aesKey.getEncoded());

        // 4. Pack: [encrypted AES key][IV][AES ciphertext + tag]
        ByteBuffer buf = ByteBuffer.allocate(encryptedAesKey.length + iv.length + aesCipherText.length);
        buf.put(encryptedAesKey);
        buf.put(iv);
        buf.put(aesCipherText);

        return Base64.getEncoder().encodeToString(buf.array());
    }

    /**
     * Decrypt with the server's private key.
     * If anything has been tampered with — wrong key, modified ciphertext,
     * truncated input — this throws.
     */

    public PaymentInstruction decrypt(String base64CipherText)throws Exception{
        byte[] all = Base64.getDecoder().decode(base64CipherText);

        if(all.length < RSA_ENCRYPTED_KEY_BYTES + GCM_IV_BYTES + GCM_TAG_BITS / 8){
            throw new IllegalArgumentException("Key is too short");
        }

        //unpack
        byte [] encryptedText = new byte[RSA_ENCRYPTED_KEY_BYTES];
        byte[] iv = new byte[GCM_IV_BYTES];
        byte[] aesKey = new byte[all.length - RSA_ENCRYPTED_KEY_BYTES - GCM_IV_BYTES];

        ByteBuffer buf = ByteBuffer.wrap(all);
        buf.get(encryptedText);
        buf.get(iv);
        buf.get(aesKey);

        // 1. RSA-decrypt the AES key.
        Cipher rsa = Cipher.getInstance(RSA_TRANSFORMATION);
        OAEPParameterSpec oaep = new OAEPParameterSpec(
                "SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT);
        rsa.init(Cipher.DECRYPT_MODE, serverKeyHolder.getPrivateKey(), oaep);
        byte[] aesKeyBytes = rsa.doFinal(encryptedText);
        SecretKey aesKeyy = new SecretKeySpec(aesKeyBytes, "AES");

        // 2. AES-GCM decrypt + verify the tag.
        Cipher aes = Cipher.getInstance(AES_TRANSFORMATION);
        aes.init(Cipher.DECRYPT_MODE, aesKeyy, new GCMParameterSpec(GCM_TAG_BITS, iv));
        byte[] plaintext = aes.doFinal(aesKey);

        return json.readValue(plaintext, PaymentInstruction.class);
    }


    public String hashCipherText(String base64CipherText) throws Exception{
        MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
        byte [] hash = sha256.digest(base64CipherText.getBytes());
        StringBuilder sb = new StringBuilder();

        for(byte b : hash){
            sb.append(String.format("%02x",b));
        }
        return sb.toString();
    }
}
