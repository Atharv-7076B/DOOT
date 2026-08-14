import { useEffect, useMemo, useState } from 'react';
import { useMeshState } from '@/api/useMeshState';
import { MAX_PACKET_TTL } from '@/lib/constants';
import type { MeshPacketDto } from '@/types/api';

export interface FlatPacket extends MeshPacketDto {
  holderDeviceId: string;
  holderHasInternet: boolean;
  hopCount: number;
}

export function usePacketExplorer() {
  const meshQuery = useMeshState({ refetchIntervalMs: 5000 });
  const [selectedPacketId, setSelectedPacketId] = useState<string | null>(null);

  const flatPackets = useMemo<FlatPacket[]>(() => {
    const devices = meshQuery.data ?? [];
    return devices.flatMap((device) =>
      device.packets.map((packet) => ({
        ...packet,
        holderDeviceId: device.deviceId,
        holderHasInternet: device.hasInternet,
        hopCount: Math.max(0, MAX_PACKET_TTL - packet.ttl),
      })),
    );
  }, [meshQuery.data]);

  useEffect(() => {
    if (flatPackets.length === 0) {
      setSelectedPacketId(null);
      return;
    }
    if (!flatPackets.some((p) => p.packetId === selectedPacketId)) {
      setSelectedPacketId(flatPackets[0]!.packetId);
    }
  }, [flatPackets, selectedPacketId]);

  const selectedPacket = useMemo(
    () => flatPackets.find((p) => p.packetId === selectedPacketId) ?? null,
    [flatPackets, selectedPacketId],
  );

  return {
    meshQuery,
    flatPackets,
    selectedPacketId,
    selectPacket: setSelectedPacketId,
    selectedPacket,
  };
}
