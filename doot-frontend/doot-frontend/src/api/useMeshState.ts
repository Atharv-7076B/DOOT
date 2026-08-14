import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { MeshStateDto } from '@/types/api';

interface UseMeshStateOptions {
  /** poll while true — used on pages actively visualizing live mesh movement */
  refetchIntervalMs?: number | false;
}

export function useMeshState({ refetchIntervalMs = false }: UseMeshStateOptions = {}) {
  return useQuery({
    queryKey: queryKeys.mesh.state(),
    queryFn: () => apiFetch<MeshStateDto>('/mesh/state'),
    refetchInterval: refetchIntervalMs,
  });
}
