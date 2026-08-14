import { Inbox } from 'lucide-react';
import { QueueItem } from '@/components/molecules/QueueItem';
import { EmptyState } from '@/components/organisms/EmptyState';
import type { SimulatedPacket } from '@/types/network';

export function PacketQueue({ packets }: { packets: SimulatedPacket[] }) {
  if (packets.length === 0) {
    return <EmptyState icon={Inbox} title="Queue empty" description="The mesh is idle — no packets awaiting relay." />;
  }

  return (
    <div>
      {packets.slice(0, 6).map((packet) => (
        <QueueItem key={packet.id} packet={packet} />
      ))}
    </div>
  );
}
