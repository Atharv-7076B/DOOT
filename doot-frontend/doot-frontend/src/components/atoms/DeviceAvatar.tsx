import { Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeviceProfile } from '@/types/network';

const ACCENT_BG: Record<DeviceProfile['accent'], string> = {
  blue: 'bg-mesh-blue',
  cyan: 'bg-mesh-cyan',
  purple: 'bg-mesh-purple',
  green: 'bg-mesh-green',
};

interface DeviceAvatarProps {
  device: Pick<DeviceProfile, 'name' | 'accent' | 'isBridge'>;
  size?: 'sm' | 'md';
  className?: string;
}

export function DeviceAvatar({ device, size = 'md', className }: DeviceAvatarProps) {
  const dimension = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm';
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-[10px] font-display font-bold text-white',
        dimension,
        ACCENT_BG[device.accent],
        className,
      )}
      aria-hidden="true"
    >
      {device.isBridge ? <Link2 className="h-4 w-4" /> : device.name.charAt(0)}
    </div>
  );
}
