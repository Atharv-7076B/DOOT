import { cn } from '@/lib/utils';
import { MAX_PACKET_TTL } from '@/lib/constants';

interface TtlHopGaugeProps {
  ttl: number;
  hopCount: number;
}

export function TtlHopGauge({ ttl, hopCount }: TtlHopGaugeProps) {
  const segments = Array.from({ length: MAX_PACKET_TTL });
  const isLow = ttl <= 1;
  const isMid = ttl > 1 && ttl <= 2;

  return (
    <div>
      <div
        className="flex gap-1"
        role="img"
        aria-label={`${hopCount} of ${MAX_PACKET_TTL} hop budget used, ${ttl} hops remaining before expiry`}
      >
        {segments.map((_, i) => {
          const used = i < hopCount;
          return (
            <span
              key={i}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors',
                used ? (isLow ? 'bg-mesh-red' : isMid ? 'bg-mesh-amber' : 'bg-mesh-cyan') : 'bg-surface-hover',
              )}
              aria-hidden="true"
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10.5px] text-muted-foreground">
        <span>{hopCount} hops used</span>
        <span className={isLow ? 'text-mesh-red' : isMid ? 'text-mesh-amber' : 'text-foreground'}>
          TTL {ttl} remaining
        </span>
      </div>
    </div>
  );
}
