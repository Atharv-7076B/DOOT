import { Lock, KeyRound, Radio, UploadCloud, ShieldCheck, CheckCircle2, FilePlus } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const STAGES = [
  { step: 1, icon: FilePlus, title: 'Created', desc: 'Payload structure initialized on sender device' },
  { step: 2, icon: Lock, title: 'Encrypted', desc: 'AES-256-GCM + RSA-2048 OAEP envelope encryption' },
  { step: 3, icon: KeyRound, title: 'Injected', desc: 'Packet loaded into local storage and queued' },
  { step: 4, icon: Radio, title: 'In Mesh', desc: 'Relaying hop-by-hop across mesh peer devices' },
  { step: 5, icon: UploadCloud, title: 'Bridge Received', desc: 'Arrived at internet-connected gateway bridge node' },
  { step: 6, icon: ShieldCheck, title: 'Decrypted & Validated', desc: 'Bridge RSA decrypted payload & validated PIN/nonce' },
  { step: 7, icon: CheckCircle2, title: 'Settled', desc: 'Transaction written to database & settled on ledger' },
] as const;

interface EncryptionLifecycleProps {
  lifecycleStep?: number;
  status?: string;
}

export function EncryptionLifecycle({ lifecycleStep = 3, status }: EncryptionLifecycleProps) {
  const reduceMotion = useReducedMotion();
  const currentStep = status === 'SETTLED' ? 7 : (lifecycleStep ?? 3);

  return (
    <div className="flex flex-col gap-3">
      <div role="list" aria-label="Packet lifecycle progress" className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {STAGES.map((stage) => {
          const isComplete = stage.step < currentStep;
          const isActive = stage.step === currentStep;

          return (
            <div key={stage.title} role="listitem" className="flex flex-col items-center gap-1.5 text-center">
              <motion.div
                animate={isActive && !reduceMotion ? { scale: [1, 1.08, 1] } : undefined}
                transition={{ duration: 1.4, repeat: isActive ? Infinity : 0 }}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border transition-all sm:h-9 sm:w-9',
                  isComplete && 'border-mesh-green bg-mesh-green/15 text-mesh-green shadow-sm',
                  isActive && 'border-mesh-cyan bg-mesh-cyan/15 text-mesh-cyan shadow-sm ring-2 ring-mesh-cyan/20',
                  !isComplete && !isActive && 'border-border bg-surface text-muted-foreground/50',
                )}
              >
                <stage.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              </motion.div>

              <div className="flex flex-col items-center gap-0.5">
                <span className="font-mono text-[9px] text-muted-foreground/70">Step {stage.step}</span>
                <span
                  className={cn(
                    'text-[10px] font-medium leading-tight',
                    isComplete && 'text-mesh-green',
                    isActive && 'font-semibold text-mesh-cyan',
                    !isComplete && !isActive && 'text-muted-foreground/60',
                  )}
                >
                  {stage.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="sr-only">
        {STAGES.map((s) => `${s.title}: ${s.desc}`).join('. ')}
      </p>
    </div>
  );
}
