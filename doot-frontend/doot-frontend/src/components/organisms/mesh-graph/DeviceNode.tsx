import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Link2, CheckCircle2, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeviceNodeData } from './types';

const ACCENT_RING: Record<string, string> = {
  blue: 'border-mesh-blue text-mesh-blue bg-mesh-blue/10',
  cyan: 'border-mesh-cyan text-mesh-cyan bg-mesh-cyan/10',
  purple: 'border-mesh-purple text-mesh-purple bg-mesh-purple/10',
  green: 'border-mesh-green text-mesh-green bg-mesh-green/10',
};

export function DeviceNode({ data }: NodeProps & { data: DeviceNodeData }) {
  const { profile, connectivity, isRelaying, isCurrentPacketNode, isVisitedNode } = data;
  const ring = ACCENT_RING[profile.accent] ?? ACCENT_RING.blue;

  const isOnline = profile.online ?? (connectivity === 'online');

  return (
    <div className="flex flex-col items-center gap-1.5" style={{ width: 110 }}>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-mesh-cyan/40 border border-mesh-cyan/80" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-mesh-cyan/40 border border-mesh-cyan/80" />

      <div className="relative flex items-center justify-center">
        {/* Animated ring for Current Packet Node */}
        {isCurrentPacketNode && (
          <span className="absolute inline-block h-14 w-14 rounded-full border-2 border-mesh-cyan animate-ping opacity-65" />
        )}

        {/* Pulsing ring for Active / Relaying */}
        {(isRelaying || (isOnline && !isCurrentPacketNode)) && (
          <span
            className={cn(
              'absolute inline-block rounded-full border opacity-25',
              profile.isBridge ? 'h-14 w-14' : 'h-11 w-11',
              ring,
            )}
          />
        )}

        {/* Main Node Circle */}
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full border-[1.75px] font-display text-xs font-bold transition-all shadow-md',
            profile.isBridge ? 'h-10 w-10 bg-mesh-green/15 border-mesh-green text-mesh-green' : 'h-9 w-9 bg-surface-elevated',
            !profile.isBridge && ring,
            isCurrentPacketNode && 'border-mesh-cyan ring-4 ring-mesh-cyan/30 scale-110 shadow-mesh-cyan/40',
            isVisitedNode && !isCurrentPacketNode && 'border-mesh-purple ring-2 ring-mesh-purple/20',
          )}
        >
          {profile.isBridge ? (
            <Link2 className="h-4 w-4 text-mesh-green" />
          ) : (
            <span>{profile.name ? profile.name.charAt(0) : 'N'}</span>
          )}

          {/* Current Packet Holder Badge */}
          {isCurrentPacketNode && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-mesh-cyan text-black">
              <Radio className="h-2.5 w-2.5 animate-pulse" />
            </span>
          )}

          {/* Visited Node Badge */}
          {isVisitedNode && !isCurrentPacketNode && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-mesh-purple text-white">
              <CheckCircle2 className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
      </div>

      {/* Node Details */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <span
            className={cn(
              'inline-block h-1.5 w-1.5 rounded-full',
              isOnline ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-muted-foreground/40',
            )}
          />
          <span className="font-mono text-[11px] font-semibold text-foreground/95">{profile.name}</span>
        </div>

        {/* VPA or Bridge Label */}
        <div className="font-mono text-[9px] text-muted-foreground tracking-tight">
          {profile.vpa ? profile.vpa : profile.isBridge ? 'bridge@doot' : 'online'}
        </div>

        {/* Badges for Bridge / Current Node */}
        {profile.isBridge && (
          <span className="mt-0.5 inline-block rounded bg-mesh-green/20 px-1 py-0.2 font-mono text-[8px] font-bold text-mesh-green uppercase tracking-wider">
            Bridge Node
          </span>
        )}

        {isCurrentPacketNode && (
          <span className="mt-0.5 inline-block rounded bg-mesh-cyan/20 px-1 py-0.2 font-mono text-[8px] font-bold text-mesh-cyan uppercase tracking-wider animate-pulse">
            Holding Packet
          </span>
        )}
      </div>
    </div>
  );
}

