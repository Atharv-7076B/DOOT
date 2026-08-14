import { DeviceCard } from '@/components/molecules/DeviceCard';
import type { DeviceProfile } from '@/types/network';

interface DevicesRowProps {
  devices: DeviceProfile[];
  recentlySettledIds: Set<string>;
}

export function DevicesRow({ devices, recentlySettledIds }: DevicesRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} justSettled={recentlySettledIds.has(device.id)} />
      ))}
    </div>
  );
}
