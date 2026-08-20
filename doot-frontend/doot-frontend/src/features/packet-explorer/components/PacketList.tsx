import { truncateHash, formatTimestamp } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PacketExplorerDto } from '@/types/api';

interface PacketListProps {
  packets: PacketExplorerDto[];
  selectedPacketId: string | null;
  onSelect: (packetId: string) => void;
}

export function PacketList({ packets, selectedPacketId, onSelect }: PacketListProps) {
  return (
    <ul role="listbox" aria-label="Packets in the mesh" className="flex flex-col gap-2">
      {packets.map((packet) => {
        const isSelected = packet.packetId === selectedPacketId;
        const statusColor = getStatusColor(packet.status);

        return (
          <li key={packet.packetId}>
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(packet.packetId)}
              className={cn(
                'flex w-full flex-col gap-1.5 rounded-lg border p-3 text-left transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected
                  ? 'border-mesh-cyan/60 bg-mesh-cyan/10 shadow-sm'
                  : 'border-border-soft bg-surface hover:bg-surface-hover',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-foreground">
                  {truncateHash(packet.packetId, 8, 4)}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide uppercase',
                    statusColor,
                  )}
                >
                  {packet.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground">
                <div>
                  <span className="text-muted-foreground/70">Node: </span>
                  <span className="font-medium text-foreground">{packet.currentNode}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/70">Hops: </span>
                  <span className="font-medium text-foreground">{packet.hopCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/70">TTL: </span>
                  <span className="font-medium text-foreground">{packet.ttl}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/70">Created: </span>
                  <span>{formatTimestamp(new Date(packet.createdAt))}</span>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'SETTLED':
      return 'bg-mesh-green/15 text-mesh-green border border-mesh-green/30';
    case 'BRIDGED':
      return 'bg-mesh-purple/15 text-mesh-purple border border-mesh-purple/30';
    case 'RELAYING':
      return 'bg-mesh-cyan/15 text-mesh-cyan border border-mesh-cyan/30';
    case 'IN_MESH':
      return 'bg-mesh-blue/15 text-mesh-blue border border-mesh-blue/30';
    case 'EXPIRED':
      return 'bg-mesh-red/15 text-mesh-red border border-mesh-red/30';
    default:
      return 'bg-surface-hover text-muted-foreground border border-border';
  }
}
