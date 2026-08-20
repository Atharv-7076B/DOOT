import { useEffect, useMemo, useState } from 'react';
import { usePackets, usePacketDetails } from '@/api/usePackets';
import type { PacketExplorerDto } from '@/types/api';

export function usePacketExplorer() {
  const packetsQuery = usePackets({ refetchIntervalMs: 1500 });
  const [selectedPacketId, setSelectedPacketId] = useState<string | null>(null);

  const packets = useMemo<PacketExplorerDto[]>(() => {
    return packetsQuery.data ?? [];
  }, [packetsQuery.data]);

  useEffect(() => {
    if (packets.length === 0) {
      setSelectedPacketId(null);
      return;
    }
    if (!selectedPacketId || !packets.some((p) => p.packetId === selectedPacketId)) {
      setSelectedPacketId(packets[0]!.packetId);
    }
  }, [packets, selectedPacketId]);

  const detailQuery = usePacketDetails(selectedPacketId, { refetchIntervalMs: 1500 });

  const selectedPacket = useMemo<PacketExplorerDto | null>(() => {
    if (detailQuery.data) return detailQuery.data;
    return packets.find((p) => p.packetId === selectedPacketId) ?? null;
  }, [detailQuery.data, packets, selectedPacketId]);

  return {
    packetsQuery,
    packets,
    selectedPacketId,
    selectPacket: setSelectedPacketId,
    selectedPacket,
  };
}
