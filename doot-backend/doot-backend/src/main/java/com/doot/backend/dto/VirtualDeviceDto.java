package com.doot.backend.dto;

import com.doot.backend.entity.MeshPacket;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VirtualDeviceDto {
    private String deviceId;
    private String name;
    private String vpa;
    private boolean online;
    private boolean isBridge;
    private boolean hasInternet;
    private BigDecimal balance;
    private List<String> connectedNodeIds;
    private List<MeshPacket> packets;

    public VirtualDeviceDto(String deviceId, boolean hasInternet, List<MeshPacket> packets) {
        this.deviceId = deviceId;
        this.hasInternet = hasInternet;
        this.packets = packets;
    }
}

