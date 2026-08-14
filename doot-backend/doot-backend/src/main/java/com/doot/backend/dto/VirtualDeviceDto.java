package com.doot.backend.dto;

import com.doot.backend.entity.MeshPacket;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VirtualDeviceDto {
    private String deviceId;
    private boolean hasInternet;
    private List<MeshPacket> packets;
}
