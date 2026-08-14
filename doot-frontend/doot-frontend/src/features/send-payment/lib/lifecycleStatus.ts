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
  const { stage, isSubmitting, isGossiping, isFlushing } = ctx;

  if (stage === 'error') {
    return ['error', 'pending', 'pending', 'pending', 'pending'];
  }
  if (stage === 'idle') {
    return isSubmitting
      ? ['active', 'active', 'pending', 'pending', 'pending']
      : ['pending', 'pending', 'pending', 'pending', 'pending'];
  }
  if (stage === 'in-mesh') {
    return ['complete', 'complete', isGossiping ? 'active' : 'active', 'pending', 'pending'];
  }
  if (stage === 'relaying') {
    return ['complete', 'complete', 'complete', isFlushing ? 'active' : 'active', 'pending'];
  }
  // 'bridged' — uploaded to backend; settlement outcome lives on the Transactions page
  return ['complete', 'complete', 'complete', 'complete', 'active'];
}
