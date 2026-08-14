import { KeyRound, Radio, Layers, Timer } from 'lucide-react';
import { Card } from '@/components/ui/card';

const FEATURES = [
  {
    icon: KeyRound,
    tint: 'bg-mesh-purple/15 text-mesh-purple',
    title: 'End-to-end encryption',
    desc: "Every packet's payload is AES-256 encrypted; the AES key itself is wrapped with the recipient's public key before it ever touches the mesh.",
  },
  {
    icon: Radio,
    tint: 'bg-mesh-cyan/15 text-mesh-cyan',
    title: 'TTL-bound mesh relay',
    desc: 'Packets carry a hop budget. Devices relay, decrement TTL, and drop anything that has wandered the mesh too long.',
  },
  {
    icon: Layers,
    tint: 'bg-mesh-blue/15 text-mesh-blue',
    title: 'Optimistic locking ledger',
    desc: 'Accounts carry a version number. Concurrent settlement attempts are rejected and retried, never silently overwritten.',
  },
  {
    icon: Timer,
    tint: 'bg-mesh-green/15 text-mesh-green',
    title: 'Deferred settlement',
    desc: 'Balances update the instant a bridge node regains connectivity and forwards its queued packets to the backend.',
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 py-20 md:px-8">
      <p className="text-eyebrow mb-5">// Why it&apos;s not just a form</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="p-5 transition-transform hover:-translate-y-1">
            <div className={`mb-4 flex h-[38px] w-[38px] items-center justify-center rounded-[10px] ${feature.tint}`}>
              <feature.icon className="h-[17px] w-[17px]" aria-hidden="true" />
            </div>
            <h4 className="mb-2 text-[14.5px] font-semibold tracking-tight">{feature.title}</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">{feature.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
