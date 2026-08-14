import type { ReactNode } from 'react';
import { StatusDot } from '@/components/atoms/StatusDot';
import { cn } from '@/lib/utils';

interface TopbarProps {
  title: string;
  right?: ReactNode;
}

export function Topbar({ title, right }: TopbarProps) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="font-display text-[21px] font-semibold tracking-tight">{title}</h2>
      <div className="flex items-center gap-2.5">{right}</div>
    </div>
  );
}

export function StatusPill({
  label,
  tone = 'green',
}: {
  label: string;
  tone?: 'green' | 'cyan';
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11.5px]',
        tone === 'green' && 'border-mesh-green/30 bg-mesh-green/10 text-mesh-green',
        tone === 'cyan' && 'border-mesh-cyan/30 bg-mesh-cyan/10 text-mesh-cyan',
      )}
    >
      <StatusDot tone={tone} />
      {label}
    </div>
  );
}
