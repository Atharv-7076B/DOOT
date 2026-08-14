import { motion, useReducedMotion } from 'framer-motion';
import { Wallet, KeyRound, Radio, Link2, Landmark } from 'lucide-react';

const STEPS = [
  { icon: Wallet, title: 'Payment', desc: 'Sender signs intent', tint: 'text-mesh-blue bg-mesh-blue/10 border-mesh-blue/25' },
  { icon: KeyRound, title: 'Encryption', desc: 'AES key wrapped w/ RSA', tint: 'text-mesh-purple bg-mesh-purple/10 border-mesh-purple/25' },
  { icon: Radio, title: 'Mesh', desc: 'Relayed hop by hop', tint: 'text-mesh-cyan bg-mesh-cyan/10 border-mesh-cyan/25' },
  { icon: Link2, title: 'Bridge', desc: 'Reaches online node', tint: 'text-mesh-blue bg-mesh-blue/10 border-mesh-blue/25' },
  { icon: Landmark, title: 'Settlement', desc: 'Ledger updated, versioned', tint: 'text-mesh-green bg-mesh-green/10 border-mesh-green/25' },
];

export function FlowStrip() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="flow" className="mx-auto max-w-[1180px] px-6 pt-14 md:px-8">
      <p className="text-eyebrow mb-4">// Payment lifecycle</p>
      <div className="relative grid grid-cols-5 gap-3">
        <div className="absolute left-[6%] right-[6%] top-[29px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        {!reduceMotion && (
          <motion.div
            className="absolute top-[26px] h-[7px] w-[7px] rounded-full bg-mesh-cyan"
            style={{ boxShadow: '0 0 12px hsl(var(--mesh-cyan)), 0 0 24px hsl(var(--mesh-cyan))' }}
            animate={{ left: ['6%', '94%'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {STEPS.map((step) => (
          <div key={step.title} className="relative z-10 text-center">
            <div className={`mx-auto mb-3.5 flex h-[58px] w-[58px] items-center justify-center rounded-2xl border ${step.tint}`}>
              <step.icon className="h-[22px] w-[22px]" aria-hidden="true" />
            </div>
            <h4 className="text-[13.5px] font-semibold">{step.title}</h4>
            <p className="text-xs text-muted-foreground">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
