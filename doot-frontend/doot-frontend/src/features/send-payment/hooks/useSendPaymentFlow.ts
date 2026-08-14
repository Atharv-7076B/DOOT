import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccounts } from '@/api/useAccounts';
import { useMeshState } from '@/api/useMeshState';
import { useSendPayment } from '@/features/send-payment/api/useSendPayment';
import { useFlushBridges, useResetMesh, useRunGossipRound } from '@/features/send-payment/api/useMeshActions';
import {
  isFormValid,
  validateSendPaymentForm,
  type SendPaymentFormErrors,
  type SendPaymentFormValues,
} from '@/lib/validation';
import { apiFetch, ApiError } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';

export type PaymentStage = 'idle' | 'in-mesh' | 'relaying' | 'bridged' | 'settled' | 'expired' | 'error';

interface PaymentStatusResponse {
  packetId?: string;
  stage: string;
  completed: boolean;
  currentNode?: string;
  hopCount?: number;
  ttl?: number;
  errorMessage?: string | null;
}

const EMPTY_FORM: SendPaymentFormValues = { sender: '', receiver: '', amount: '', pin: '' };

export function useSendPaymentFlow() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SendPaymentFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<SendPaymentFormErrors>({});
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPacketId, setCurrentPacketId] = useState<string | null>(null);

  const accountsQuery = useAccounts();
  const meshQuery = useMeshState({ refetchIntervalMs: stage === 'idle' ? false : 1500 });

  const sendPayment = useSendPayment();
  const runGossip = useRunGossipRound();
  const flushBridges = useFlushBridges();
  const resetMesh = useResetMesh();

  const setField = useCallback((field: keyof SendPaymentFormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const submit = useCallback(() => {
    const nextErrors = validateSendPaymentForm(form);
    setErrors(nextErrors);
    if (!isFormValid(nextErrors)) return;

    setErrorMessage(null);
    sendPayment.mutate(
      { sender: form.sender, receiver: form.receiver, amount: Number(form.amount), pin: form.pin },
      {
        onSuccess: (data) => {
          if (data?.packetId) {
            setCurrentPacketId(data.packetId);
          }
          setStage('in-mesh');
        },
        onError: (error) => {
          setStage('error');
          setErrorMessage(error instanceof ApiError ? error.message : 'Failed to inject payment into the mesh.');
        },
      },
    );
  }, [form, sendPayment]);

  // Automatic payment lifecycle polling
  useEffect(() => {
    if (!currentPacketId || stage === 'settled' || stage === 'expired' || stage === 'error') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await apiFetch<PaymentStatusResponse>(`/demo/payment/${currentPacketId}/status`);
        if (res) {
          if (res.stage === 'SETTLED') {
            setStage('settled');
            queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.mesh.state() });
          } else if (res.stage === 'BRIDGED') {
            setStage('bridged');
          } else if (res.stage === 'RELAYING') {
            setStage('relaying');
          } else if (res.stage === 'EXPIRED') {
            setStage('expired');
            setErrorMessage(res.errorMessage ?? 'Payment expired in mesh (TTL reached 0).');
          } else if (res.stage === 'ERROR') {
            setStage('error');
            setErrorMessage(res.errorMessage ?? 'Error processing payment at bridge.');
          }
        }
      } catch {
        // Silent catch during transient polling
      }
    }, 800);

    return () => clearInterval(interval);
  }, [currentPacketId, stage, queryClient]);

  const gossip = useCallback(() => {
    runGossip.mutate(undefined, {
      onSuccess: () => setStage('relaying'),
      onError: (error) => setErrorMessage(error instanceof ApiError ? error.message : 'Gossip round failed.'),
    });
  }, [runGossip]);

  const flush = useCallback(() => {
    flushBridges.mutate(undefined, {
      onSuccess: () => setStage('bridged'),
      onError: (error) => setErrorMessage(error instanceof ApiError ? error.message : 'Bridge flush failed.'),
    });
  }, [flushBridges]);

  const reset = useCallback(() => {
    resetMesh.mutate(undefined, {
      onSuccess: () => {
        setStage('idle');
        setCurrentPacketId(null);
        setForm(EMPTY_FORM);
        setErrors({});
        setErrorMessage(null);
      },
    });
  }, [resetMesh]);

  const devicesHoldingPackets = useMemo(
    () => (meshQuery.data ?? []).filter((device) => device.packets.length > 0),
    [meshQuery.data],
  );

  return {
    form,
    errors,
    setField,
    submit,
    isSubmitting: sendPayment.isPending,
    stage,
    errorMessage,
    accountsQuery,
    meshQuery,
    devicesHoldingPackets,
    gossip,
    isGossiping: runGossip.isPending,
    flush,
    isFlushing: flushBridges.isPending,
    reset,
    isResetting: resetMesh.isPending,
  };
}
