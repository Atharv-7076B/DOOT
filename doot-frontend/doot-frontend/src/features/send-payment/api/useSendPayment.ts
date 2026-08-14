import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { SendPaymentRequest, MeshPacketDto } from '@/types/api';

export function useSendPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendPaymentRequest) =>
      apiFetch<MeshPacketDto>('/demo/send', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      // A new packet now sits with the sender device — refresh the mesh view.
      queryClient.invalidateQueries({ queryKey: queryKeys.mesh.state() });
    },
  });
}
