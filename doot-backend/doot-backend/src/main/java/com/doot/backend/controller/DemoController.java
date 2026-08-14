package com.doot.backend.controller;

import com.doot.backend.dto.PaymentRequest;
import com.doot.backend.entity.MeshPacket;
import com.doot.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.doot.backend.service.MeshService;
import java.util.Map;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
public class DemoController {

    private final PaymentService paymentService;
    private final MeshService meshService;

    @PostMapping("/send")
    public ResponseEntity<MeshPacket> sendPayment(@RequestBody PaymentRequest request) throws Exception {
        MeshPacket packet = paymentService.createPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(packet);
    }

    @GetMapping("/payment/{packetId}/status")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(@PathVariable String packetId) {
        Map<String, Object> status = meshService.getPaymentStatus(packetId);
        return ResponseEntity.ok(status);
    }
}
