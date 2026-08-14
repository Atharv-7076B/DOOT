import { StatusDot, type StatusDotTone } from '@/components/atoms/StatusDot';
import { cn } from '@/lib/utils';
import type { DeviceConnectivity } from '@/types/network';

const CONNECTIVITY_CONFIG: Record<DeviceConnectivity, { label: string; tone: StatusDotTone; className: string }> = {
  online: { label: 'online', tone: 'green', className: 'bg-mesh-green/10 text-mesh-green' },
  relaying: { label: 'relaying', tone: 'cyan', className: 'bg-mesh-cyan/10 text-mesh-cyan' },
  unreachable: { label: 'unreachable', tone: 'red', className: 'bg-mesh-red/10 text-mesh-red' },
};

interface ConnectivityBadgeProps {
  connectivity: DeviceConnectivity;
  /** override label, e.g. "gateway" for the bridge node when online */
  label?: string;
}

export function ConnectivityBadge({ connectivity, label }: ConnectivityBadgeProps) {
  const config = CONNECTIVITY_CONFIG[connectivity];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-[9.5px]',
        config.className,
      )}
    >
      <StatusDot tone={config.tone} pulse={connectivity !== 'unreachable'} />
      {label ?? config.label}
    </span>
  );
}
