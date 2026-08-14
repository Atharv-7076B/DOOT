import { motion, useReducedMotion } from 'framer-motion';
import { Wallet, KeyRound, Radio, Link2, Landmark, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLifecycleStepStatuses, type LifecycleContext } from '@/features/send-payment/lib/lifecycleStatus';

const STEPS = [
  { icon: Wallet, title: 'Payment' },
  { icon: KeyRound, title: 'Encryption' },
  { icon: Radio, title: 'Mesh' },
  { icon: Link2, title: 'Bridge' },
  { icon: Landmark, title: 'Settlement' },
] as const;

const STATUS_CLASSES: Record<string, string> = {
  pending: 'border-border bg-surface text-muted-foreground',
  active: 'border-mesh-cyan bg-mesh-cyan/10 text-mesh-cyan',
  complete: 'border-mesh-green bg-mesh-green/10 text-mesh-green',
  error: 'border-mesh-red bg-mesh-red/10 text-mesh-red',
};

export function PaymentLifecycle(props: LifecycleContext) {
  const reduceMotion = useReducedMotion();
  const statuses = getLifecycleStepStatuses(props);

  return (
    <div role="list" aria-label="Payment lifecycle progress" className="relative grid grid-cols-5 gap-2">
      <div className="absolute left-[10%] right-[10%] top-[26px] -z-10 h-px bg-border-soft" aria-hidden="true" />
      {STEPS.map((step, index) => {
        const status = statuses[index] ?? 'pending';
        const StepIcon = status === 'complete' ? Check : status === 'error' ? AlertTriangle : step.icon;
        return (
          <div key={step.title} role="listitem" className="flex flex-col items-center gap-2 text-center">
            <motion.div
              animate={status === 'active' && !reduceMotion ? { scale: [1, 1.08, 1] } : undefined}
              transition={{ duration: 1.4, repeat: status === 'active' ? Infinity : 0 }}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors',
                STATUS_CLASSES[status],
              )}
            >
              <StepIcon className="h-4 w-4" aria-hidden="true" />
            </motion.div>
            <div>
              <div className="text-[11.5px] font-medium">{step.title}</div>
              <div className="font-mono text-[9.5px] uppercase tracking-wide text-muted-foreground/70">{status}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
