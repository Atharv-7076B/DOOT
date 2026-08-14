import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: LucideIcon;
  iconClassName?: string;
  trend?: string;
  value: string;
  label: string;
}

export function MetricCard({ icon: Icon, iconClassName, trend, value, label }: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="mb-3.5 flex items-start justify-between">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-[9px]', iconClassName)}>
          <Icon className="h-4 w-4" />
        </div>
        {trend ? <span className="font-mono text-[11px] text-mesh-green">{trend}</span> : null}
      </div>
      <div className="font-display text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </Card>
  );
}
