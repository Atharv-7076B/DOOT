import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TransactionStatus } from '@/types/api';

const CONFIG: Record<TransactionStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  SETTLED: { label: 'Settled', icon: CheckCircle2, className: 'bg-mesh-green/10 text-mesh-green border-mesh-green/25' },
  REJECTED: { label: 'Rejected', icon: XCircle, className: 'bg-mesh-red/10 text-mesh-red border-mesh-red/25' },
};

export function StatusIndicator({ status }: { status: TransactionStatus }) {
  const config = CONFIG[status];
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[10.5px]', config.className)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}
