import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';

function useMeshMutation(path: string, affectsLedger: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch<unknown>(path, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mesh.state() });
      if (affectsLedger) {
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts.list() });
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.list() });
      }
    },
  });
}

/** POST /api/mesh/gossip — one round of device-to-device relay. */
export function useRunGossipRound() {
  return useMeshMutation('/mesh/gossip', false);
}

/** POST /api/mesh/flush — bridge devices upload held packets to the backend. */
export function useFlushBridges() {
  return useMeshMutation('/mesh/flush', true);
}

/** POST /api/mesh/reset — clear mesh + idempotency cache. */
export function useResetMesh() {
  return useMeshMutation('/mesh/reset', true);
}
