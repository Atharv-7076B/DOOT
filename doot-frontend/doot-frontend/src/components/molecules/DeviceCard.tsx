import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { DeviceAvatar } from '@/components/atoms/DeviceAvatar';
import { ConnectivityBadge } from '@/components/molecules/ConnectivityBadge';
import { formatCurrency } from '@/lib/format';
import type { DeviceProfile } from '@/types/network';

interface DeviceCardProps {
  device: DeviceProfile;
  /** true for one animation cycle right after a settlement lands on this device */
  justSettled?: boolean;
}

export function DeviceCard({ device, justSettled }: DeviceCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2.5">
        <DeviceAvatar device={device} />
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-semibold">{device.name}</div>
          <div className="truncate font-mono text-[10.5px] text-muted-foreground">{device.vpa}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <motion.span
          key={device.balance}
          initial={justSettled ? { color: 'hsl(var(--mesh-green))' } : false}
          animate={{ color: 'hsl(var(--foreground))' }}
          transition={{ duration: 0.6 }}
          className="font-mono text-[13px]"
        >
          {device.isBridge ? '—' : formatCurrency(device.balance)}
        </motion.span>
        <ConnectivityBadge connectivity={device.connectivity} label={device.isBridge ? 'gateway' : undefined} />
      </div>
    </Card>
  );
}
