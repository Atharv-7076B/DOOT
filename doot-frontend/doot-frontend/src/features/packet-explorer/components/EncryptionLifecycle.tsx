import { Lock, KeyRound, ShieldCheck, Radio, UploadCloud } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const STAGES = [
  { icon: Lock, title: 'AES-256-GCM', desc: 'Payload encrypted with a fresh per-packet key' },
  { icon: KeyRound, title: 'RSA-OAEP', desc: "AES key wrapped with the server's public key" },
  { icon: ShieldCheck, title: 'Opaque', desc: 'Intermediates see ciphertext only' },
  { icon: Radio, title: 'Relaying', desc: 'Hopping device to device' },
  { icon: UploadCloud, title: 'Bridge-ready', desc: 'Held by a device with internet' },
] as const;

export function EncryptionLifecycle({ heldByBridge }: { heldByBridge: boolean }) {
  const reduceMotion = useReducedMotion();
  // The first three stages are always true for any packet that exists in mesh state —
  // it was encrypted client-side before ever being broadcast. The last two reflect
  // this specific packet's current position.
  const activeIndex = heldByBridge ? 4 : 3;

  return (
    <div role="list" aria-label="Encryption lifecycle" className="grid grid-cols-5 gap-2">
      {STAGES.map((stage, index) => {
        const isComplete = index < activeIndex;
        const isActive = index === activeIndex;
        return (
          <div key={stage.title} role="listitem" className="flex flex-col items-center gap-1.5 text-center">
            <motion.div
              animate={isActive && !reduceMotion ? { scale: [1, 1.08, 1] } : undefined}
              transition={{ duration: 1.4, repeat: isActive ? Infinity : 0 }}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border',
                isComplete && 'border-mesh-green bg-mesh-green/10 text-mesh-green',
                isActive && 'border-mesh-cyan bg-mesh-cyan/10 text-mesh-cyan',
                !isComplete && !isActive && 'border-border bg-surface text-muted-foreground',
              )}
            >
              <stage.icon className="h-3.5 w-3.5" aria-hidden="true" />
            </motion.div>
            <div className="text-[10px] font-medium leading-tight">{stage.title}</div>
          </div>
        );
      })}
      <p className="sr-only">
        {STAGES.map((s) => s.desc).join('. ')}
      </p>
    </div>
  );
}
