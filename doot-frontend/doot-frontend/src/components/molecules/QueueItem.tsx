import { truncateHash } from '@/lib/format';
import type { SimulatedPacket } from '@/types/network';
import { DEVICE_ROSTER, MAX_PACKET_TTL } from '@/lib/constants';

/**
 * Visualizes TTL as a depleting bar rather than a bare number — the shrinking
 * fill communicates "this packet's hop budget is running out" at a glance.
 */
export function QueueItem({ packet }: { packet: SimulatedPacket }) {
  const ttlRatio = packet.ttl / MAX_PACKET_TTL;
  const isLow = ttlRatio <= 0.4;

  return (
    <div className="flex items-center gap-3 border-b border-border-soft py-2 text-[11.5px] last:border-b-0">
      <span className="w-14 shrink-0 font-mono text-muted-foreground/70">#{packet.id.slice(-4)}</span>
      <span className="flex-1 truncate font-mono text-muted-foreground">{truncateHash(packet.hash)}</span>
      <span className="w-28 shrink-0 text-muted-foreground">
        {DEVICE_ROSTER[packet.from].name} → {DEVICE_ROSTER[packet.to].name}
      </span>
      <div className="flex w-20 shrink-0 items-center gap-1.5">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-hover">
          <div
            className={isLow ? 'h-full bg-mesh-red' : 'h-full bg-mesh-amber'}
            style={{ width: `${ttlRatio * 100}%` }}
          />
        </div>
        <span className={isLow ? 'font-mono text-[10px] text-mesh-red' : 'font-mono text-[10px] text-mesh-amber'}>
          {packet.ttl}
        </span>
      </div>
    </div>
  );
}
