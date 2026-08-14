import { useCallback, useMemo, useState } from 'react';
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
import { ApiError } from '@/api/client';

export type PaymentStage = 'idle' | 'in-mesh' | 'relaying' | 'bridged' | 'error';

const EMPTY_FORM: SendPaymentFormValues = { sender: '', receiver: '', amount: '', pin: '' };

export function useSendPaymentFlow() {
  const [form, setForm] = useState<SendPaymentFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<SendPaymentFormErrors>({});
  const [stage, setStage] = useState<PaymentStage>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const accountsQuery = useAccounts();
  const meshQuery = useMeshState({ refetchIntervalMs: stage === 'idle' ? false : 4000 });

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
        onSuccess: () => setStage('in-mesh'),
        onError: (error) => {
          setStage('error');
          setErrorMessage(error instanceof ApiError ? error.message : 'Failed to inject payment into the mesh.');
        },
      },
    );
  }, [form, sendPayment]);

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
