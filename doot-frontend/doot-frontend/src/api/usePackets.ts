import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { PacketExplorerDto } from '@/types/api';

export function usePackets(options?: { refetchIntervalMs?: number }) {
  return useQuery({
    queryKey: queryKeys.packets.list(),
    queryFn: () => apiFetch<PacketExplorerDto[]>('/mesh/packets'),
    refetchInterval: options?.refetchIntervalMs ?? 1500,
  });
}

export function usePacketDetails(packetId: string | null, options?: { refetchIntervalMs?: number }) {
  return useQuery({
    queryKey: queryKeys.packets.detail(packetId ?? ''),
    queryFn: () => apiFetch<PacketExplorerDto>(`/mesh/packets/${packetId}`),
    enabled: Boolean(packetId),
    refetchInterval: options?.refetchIntervalMs ?? 1500,
  });
}
