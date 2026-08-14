import { Shuffle, UploadCloud, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusDot } from '@/components/atoms/StatusDot';
import type { VirtualDeviceDto } from '@/types/api';

interface MeshActionsPanelProps {
  devicesHoldingPackets: VirtualDeviceDto[];
  onGossip: () => void;
  isGossiping: boolean;
  onFlush: () => void;
  isFlushing: boolean;
  onReset: () => void;
  isResetting: boolean;
  disabled: boolean;
}

export function MeshActionsPanel({
  devicesHoldingPackets,
  onGossip,
  isGossiping,
  onFlush,
  isFlushing,
  onReset,
  isResetting,
  disabled,
}: MeshActionsPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2.5">
        <Button variant="ghost" size="sm" onClick={onGossip} disabled={disabled || isGossiping}>
          <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
          {isGossiping ? 'Relaying…' : 'Run Gossip Round'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onFlush} disabled={disabled || isFlushing}>
          <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
          {isFlushing ? 'Uploading…' : 'Bridges Upload'}
        </Button>
        <Button variant="outline" size="sm" onClick={onReset} disabled={isResetting}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset Mesh
        </Button>
      </div>

      <div>
        <p className="mb-2 text-eyebrow">// Devices currently holding this packet</p>
        {devicesHoldingPackets.length === 0 ? (
          <p className="text-xs text-muted-foreground">No device currently holds a packet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {devicesHoldingPackets.map((device) => (
              <li
                key={device.deviceId}
                className="flex items-center gap-2 rounded-full border border-border-soft bg-surface px-3 py-1.5 font-mono text-[11px]"
              >
                <StatusDot tone={device.hasInternet ? 'cyan' : 'neutral'} pulse={device.hasInternet} />
                {device.deviceId}
                <span className="text-muted-foreground">· {device.packets.length} pkt</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
