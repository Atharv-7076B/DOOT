import { PackageSearch } from 'lucide-react';
import { Topbar } from '@/app/layout/Topbar';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QueryState } from '@/components/organisms/QueryState';
import { EmptyState } from '@/components/organisms/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { PacketList } from '@/features/packet-explorer/components/PacketList';
import { PacketDetail } from '@/features/packet-explorer/components/PacketDetail';
import { usePacketExplorer } from '@/features/packet-explorer/hooks/usePacketExplorer';

export function PacketExplorerPage() {
  const { meshQuery, flatPackets, selectedPacketId, selectPacket, selectedPacket } = usePacketExplorer();

  return (
    <div>
      <Topbar title="Packet Explorer" />

      <QueryState
        isLoading={meshQuery.isLoading}
        isError={meshQuery.isError}
        data={meshQuery.data}
        loadingFallback={
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.35fr_0.65fr]">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        }
        errorDescription="Couldn't load mesh state from the backend. Confirm the server is running on :8080."
        onRetry={() => meshQuery.refetch()}
        isEmpty={() => flatPackets.length === 0}
        emptyFallback={
          <EmptyState
            icon={PackageSearch}
            title="No packets in the mesh"
            description="Send a payment from the Send Payment page to see live packet internals here."
          />
        }
      >
        {() => (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.35fr_0.65fr]">
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Live Packets</CardTitle>
                <CardDescription>{flatPackets.length} in mesh</CardDescription>
              </CardHeader>
              <PacketList packets={flatPackets} selectedPacketId={selectedPacketId} onSelect={selectPacket} />
            </Card>

            {selectedPacket ? (
              <PacketDetail packet={selectedPacket} />
            ) : (
              <Card className="flex items-center justify-center p-5">
                <p className="text-sm text-muted-foreground">Select a packet to inspect it.</p>
              </Card>
            )}
          </div>
        )}
      </QueryState>
    </div>
  );
}
