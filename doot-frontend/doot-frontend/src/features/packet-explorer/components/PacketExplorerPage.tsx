import { PackageSearch, RefreshCw } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Topbar } from '@/app/layout/Topbar';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QueryState } from '@/components/organisms/QueryState';
import { EmptyState } from '@/components/organisms/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { PacketList } from '@/features/packet-explorer/components/PacketList';
import { PacketDetail } from '@/features/packet-explorer/components/PacketDetail';
import { usePacketExplorer } from '@/features/packet-explorer/hooks/usePacketExplorer';
import { cn } from '@/lib/utils';

export function PacketExplorerPage() {
  const { packetsQuery, packets, selectedPacketId, selectPacket, selectedPacket } = usePacketExplorer();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'SETTLED'>('ALL');

  const filteredPackets = useMemo(() => {
    if (filter === 'ACTIVE') {
      return packets.filter((p) => p.status !== 'SETTLED' && p.status !== 'EXPIRED');
    }
    if (filter === 'SETTLED') {
      return packets.filter((p) => p.status === 'SETTLED');
    }
    return packets;
  }, [filter, packets]);

  return (
    <div>
      <Topbar title="Packet Explorer" />

      <QueryState
        isLoading={packetsQuery.isLoading}
        isError={packetsQuery.isError}
        data={packets}
        loadingFallback={
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.38fr_0.62fr]">
            <Skeleton className="h-[500px] w-full rounded-2xl" />
            <Skeleton className="h-[500px] w-full rounded-2xl" />
          </div>
        }
        errorDescription="Couldn't load packet state from the backend. Confirm the server is running on :8080."
        onRetry={() => packetsQuery.refetch()}
        isEmpty={() => packets.length === 0}
        emptyFallback={
          <EmptyState
            icon={PackageSearch}
            title="No packets in the mesh"
            description="Send a payment from the Send Payment page to see live packet internals, transport state, and security metadata here."
          />
        }
      >
        {() => (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.38fr_0.62fr]">
            {/* Packet List Sidebar */}
            <Card className="flex flex-col gap-4 p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Packet Explorer</CardTitle>
                  <CardDescription>
                    {packets.length} packet(s) tracked ({packets.filter((p) => p.status !== 'SETTLED').length} active)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <RefreshCw className={cn('h-3.5 w-3.5', packetsQuery.isFetching && 'animate-spin text-mesh-cyan')} />
                  <span className="font-mono text-[10px]">Auto 1.5s</span>
                </div>
              </CardHeader>

              {/* Filter Tabs */}
              <div className="flex rounded-lg border border-border-soft bg-surface p-1">
                {(['ALL', 'ACTIVE', 'SETTLED'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilter(tab)}
                    className={cn(
                      'flex-1 rounded-md py-1 font-mono text-[11px] font-medium transition-colors',
                      filter === tab
                        ? 'bg-mesh-cyan/15 text-mesh-cyan shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {tab === 'ALL' ? 'All' : tab === 'ACTIVE' ? 'Active Mesh' : 'Settled'}
                  </button>
                ))}
              </div>

              {filteredPackets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-xs text-muted-foreground">No packets match the "{filter}" filter.</p>
                </div>
              ) : (
                <PacketList
                  packets={filteredPackets}
                  selectedPacketId={selectedPacketId}
                  onSelect={selectPacket}
                />
              )}
            </Card>

            {/* Selected Packet Detailed View */}
            {selectedPacket ? (
              <PacketDetail packet={selectedPacket} />
            ) : (
              <Card className="flex flex-col items-center justify-center p-12 text-center">
                <PackageSearch className="mb-2 h-10 w-10 text-muted-foreground/40" />
                <p className="font-mono text-sm text-muted-foreground">Select a packet from the list to inspect full internals.</p>
              </Card>
            )}
          </div>
        )}
      </QueryState>
    </div>
  );
}
