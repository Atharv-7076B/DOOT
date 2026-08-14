import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeviceNodeData } from './types';

const ACCENT_RING: Record<string, string> = {
  blue: 'border-mesh-blue text-mesh-blue',
  cyan: 'border-mesh-cyan text-mesh-cyan',
  purple: 'border-mesh-purple text-mesh-purple',
  green: 'border-mesh-green text-mesh-green',
};

/**
 * Visualizes device connectivity and bridge-relay activity directly on the node:
 * an expanding ring pulses to communicate "this device is reachable / actively
 * relaying," not just a caption underneath.
 */
export function DeviceNode({ data }: NodeProps & { data: DeviceNodeData }) {
  const { profile, connectivity, isRelaying } = data;
  const ring = ACCENT_RING[profile.accent] ?? ACCENT_RING.blue;

  return (
    <div className="flex flex-col items-center gap-1.5" style={{ width: 96 }}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="relative flex items-center justify-center">
        <span
          className={cn(
            'absolute inline-block rounded-full border opacity-25',
            profile.isBridge ? 'h-14 w-14' : 'h-11 w-11',
            ring,
            (isRelaying || connectivity === 'online') && 'animate-ping',
          )}
        />
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full border-[1.5px] bg-surface-elevated font-display text-xs font-semibold',
            profile.isBridge ? 'h-9 w-9' : 'h-8 w-8',
            ring,
          )}
        >
          {profile.isBridge ? <Link2 className="h-3.5 w-3.5" /> : profile.name.charAt(0)}
        </div>
      </div>
      <div className="text-center">
        <div className="font-mono text-[10px] text-foreground/90">{profile.name}</div>
        <div className="font-mono text-[8.5px] text-muted-foreground">
          {profile.isBridge ? 'gateway' : connectivity}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
