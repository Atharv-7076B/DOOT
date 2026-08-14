import type { PaymentStage } from '@/features/send-payment/hooks/useSendPaymentFlow';

export type StepStatus = 'pending' | 'active' | 'complete' | 'error';

export interface LifecycleContext {
  stage: PaymentStage;
  isSubmitting: boolean;
  isGossiping: boolean;
  isFlushing: boolean;
}

/** Returns one status per stage: [Payment, Encryption, Mesh, Bridge, Settlement]. */
export function getLifecycleStepStatuses(ctx: LifecycleContext): StepStatus[] {
  const { stage, isSubmitting } = ctx;

  if (stage === 'error') {
    return ['error', 'error', 'pending', 'pending', 'pending'];
  }
  if (stage === 'expired') {
    return ['complete', 'complete', 'error', 'pending', 'pending'];
  }
  if (stage === 'idle') {
    return isSubmitting
      ? ['active', 'active', 'pending', 'pending', 'pending']
      : ['pending', 'pending', 'pending', 'pending', 'pending'];
  }
  if (stage === 'in-mesh') {
    return ['complete', 'complete', 'active', 'pending', 'pending'];
  }
  if (stage === 'relaying') {
    return ['complete', 'complete', 'complete', 'pending', 'pending'];
  }
  if (stage === 'bridged') {
    return ['complete', 'complete', 'complete', 'active', 'pending'];
  }
  if (stage === 'settled') {
    return ['complete', 'complete', 'complete', 'complete', 'complete'];
  }
  return ['pending', 'pending', 'pending', 'pending', 'pending'];
}
