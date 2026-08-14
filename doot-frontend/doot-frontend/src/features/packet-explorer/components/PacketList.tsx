import { truncateHash } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { FlatPacket } from '@/features/packet-explorer/hooks/usePacketExplorer';

interface PacketListProps {
  packets: FlatPacket[];
  selectedPacketId: string | null;
  onSelect: (packetId: string) => void;
}

export function PacketList({ packets, selectedPacketId, onSelect }: PacketListProps) {
  return (
    <ul role="listbox" aria-label="Packets currently in the mesh" className="flex flex-col gap-1.5">
      {packets.map((packet) => {
        const isSelected = packet.packetId === selectedPacketId;
        return (
          <li key={packet.packetId}>
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(packet.packetId)}
              className={cn(
                'flex w-full flex-col gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected
                  ? 'border-mesh-cyan/40 bg-mesh-cyan/10'
                  : 'border-border-soft bg-surface hover:bg-surface-hover',
              )}
            >
              <span className="font-mono text-[11.5px]">{truncateHash(packet.packetId, 8, 6)}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                held by {packet.holderDeviceId} · TTL {packet.ttl}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
