package com.doot.backend.controller;

import com.doot.backend.dto.VirtualDeviceDto;
import com.doot.backend.service.MeshService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mesh")
@RequiredArgsConstructor
public class MeshController {

    private final MeshService meshService;

    @GetMapping("/state")
    public List<VirtualDeviceDto> getMeshState() {
        return meshService.getMeshState();
    }

    @GetMapping("/packets")
    public List<com.doot.backend.dto.PacketExplorerDto> getPacketExplorerList() {
        return meshService.getPacketExplorerList();
    }

    @GetMapping("/packets/{packetId}")
    public ResponseEntity<com.doot.backend.dto.PacketExplorerDto> getPacketExplorerDetails(@PathVariable String packetId) {
        com.doot.backend.dto.PacketExplorerDto dto = meshService.getPacketExplorerDetails(packetId);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/gossip")
    public ResponseEntity<Map<String, String>> triggerGossip() {
        meshService.runGossipRound();
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Gossip round executed"));
    }

    @PostMapping("/flush")
    public ResponseEntity<Map<String, String>> triggerFlush() {
        meshService.flushBridges();
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Bridge flush executed"));
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, String>> resetMesh() {
        meshService.resetMesh();
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Mesh reset successfully"));
    }
}
