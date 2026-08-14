import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusDot } from '@/components/atoms/StatusDot';
import { HeroMesh } from '@/features/landing/components/HeroMesh';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 px-6 pb-10 pt-12 md:px-8 md:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-mesh-cyan/25 bg-mesh-cyan/10 px-3 py-1.5 font-mono text-[11.5px] text-mesh-cyan">
          <StatusDot tone="cyan" />
          MESH SIMULATOR — LIVE
        </div>
        <h1 className="mb-5 font-display text-[38px] font-bold leading-[1.08] tracking-tight sm:text-[52px]">
          Send money when
          <br />
          the internet{' '}
          <span className="bg-gradient-to-r from-mesh-blue via-mesh-cyan to-mesh-purple bg-clip-text text-transparent">
            doesn&apos;t show up.
          </span>
        </h1>
        <p className="mb-8 max-w-[480px] text-[16.5px] leading-relaxed text-muted-foreground">
          DOOT simulates UPI payments relayed peer-to-peer over Bluetooth mesh — encrypted, TTL-bound, and settled
          the moment any device reconnects to a bridge node.
        </p>
        <div className="mb-9 flex flex-wrap gap-3">
          <Button onClick={() => navigate('/dashboard')}>
            <Play className="h-4 w-4" />
            Launch Simulator
          </Button>
          <Button
            variant="ghost"
            onClick={() => document.getElementById('flow')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See how it works
          </Button>
        </div>
        <div className="flex gap-8">
          <Stat value="AES-256" label="Payload encryption" />
          <Stat value="≤5 hops" label="TTL-bound relay" />
          <Stat value="Optimistic" label="Ledger locking" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="glass relative h-[300px] overflow-hidden rounded-[22px] sm:h-[380px] lg:h-[420px]"
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--border-soft)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border-soft)) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <HeroMesh />
      </motion.div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <b className="block font-display text-xl">{value}</b>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
