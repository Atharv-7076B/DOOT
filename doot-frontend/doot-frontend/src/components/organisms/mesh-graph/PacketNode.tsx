import type { NodeProps } from '@xyflow/react';
import type { PacketNodeData } from './types';

/**
 * A packet in flight. Renders glowing particle with hop count and TTL indicators.
 */
export function PacketNode({ data }: NodeProps & { data: PacketNodeData }) {
  const { color, hopCount, ttl, packetId } = data;
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="h-3 w-3 rounded-full animate-ping opacity-75"
        style={{ background: color }}
      />
      <div
        className="absolute h-3 w-3 rounded-full border border-white/60 shadow-lg"
        style={{ background: color, boxShadow: `0 0 12px ${color}, 0 0 20px ${color}` }}
      />
      {(hopCount !== undefined || ttl !== undefined) && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-surface-elevated/90 px-1.5 py-0.5 border border-border-soft text-[9px] font-mono font-semibold text-foreground shadow-md backdrop-blur-sm">
          {packetId && <span className="text-mesh-cyan mr-1">{packetId.slice(0, 7)}</span>}
          {hopCount !== undefined && <span>Hops:{hopCount} </span>}
          {ttl !== undefined && <span className="text-amber-400">TTL:{ttl}</span>}
        </div>
      )}
    </div>
  );
}

