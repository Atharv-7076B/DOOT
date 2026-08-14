import { Waypoints, ScrollText, Link2, Send } from 'lucide-react';
import { Topbar, StatusPill } from '@/app/layout/Topbar';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MeshGraph } from '@/components/organisms/mesh-graph/MeshGraph';
import { ActivityLog } from '@/components/organisms/ActivityLog';
import { SettlementPanel } from '@/components/organisms/SettlementPanel';
import { PacketQueue } from '@/components/organisms/PacketQueue';
import { DevicesRow } from '@/components/organisms/DevicesRow';
import { MetricsRow } from '@/features/dashboard/components/MetricsRow';
import { useMeshSimulation } from '@/features/dashboard/hooks/useMeshSimulation';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatCountdown } from '@/lib/format';

export function DashboardPage() {
  const { showToast } = useToast();
  const {
    devices,
    logs,
    queue,
    animatedPackets,
    activeBackendPackets,
    relayingDeviceIds,
    recentlySettledIds,
    metrics,
    sendRealPayment,
    settlement,
  } = useMeshSimulation({
    onSettlementBatch: (amount) => {
      if (amount > 0) {
        showToast('Settlement complete', `Bridge flushed ${formatCurrency(amount)} to the backend ledger.`);
      }
    },
  });

  return (
    <div>
      <Topbar
        title="Live Mesh Dashboard"
        right={
          <>
            <StatusPill label="MESH ONLINE" tone="green" />
            <StatusPill label={`SETTLING IN ${formatCountdown(settlement.secondsUntilNextBatch)}`} tone="cyan" />
          </>
        }
      />

      <MetricsRow metrics={metrics} />

      <div className="mb-4 grid grid-cols-1 gap-3.5 xl:grid-cols-[1.65fr_1fr]">
        <Card className="p-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                <Waypoints className="h-4 w-4 text-mesh-cyan" aria-hidden="true" />
                Mesh Network State
              </CardTitle>
              <CardDescription>
                {Object.keys(devices).length || 4} nodes · {activeBackendPackets.length} active packet{activeBackendPackets.length === 1 ? '' : 's'}
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-mesh-cyan/40 bg-mesh-cyan/10 text-mesh-cyan hover:bg-mesh-cyan/20 hover:text-white"
              onClick={() => sendRealPayment('alice@doot', 'charlie@doot', 250)}
            >
              <Send className="h-3.5 w-3.5" />
              Send Payment (Alice → Charlie)
            </Button>
          </CardHeader>
          <MeshGraph
            devices={devices}
            relayingDeviceIds={relayingDeviceIds}
            animatedPackets={animatedPackets}
            activePackets={activeBackendPackets}
          />
        </Card>

        <div className="flex flex-col gap-3.5">
          <Card className="p-5">
            <CardHeader>
              <CardTitle>
                <ScrollText className="h-4 w-4 text-mesh-blue" aria-hidden="true" />
                Live Activity Log
              </CardTitle>
              <CardDescription>real-time backend events</CardDescription>
            </CardHeader>
            <ActivityLog entries={logs} />
          </Card>

          <Card className="p-5">
            <CardHeader>
              <CardTitle>
                <Link2 className="h-4 w-4 text-mesh-green" aria-hidden="true" />
                Settlement
              </CardTitle>
            </CardHeader>
            <SettlementPanel state={settlement} />
          </Card>
        </div>
      </div>

      <Card className="mb-4 p-5">
        <CardHeader>
          <CardTitle>Packet Queue</CardTitle>
          <CardDescription>{queue.length} pending in mesh</CardDescription>
        </CardHeader>
        <PacketQueue packets={queue} />
      </Card>

      <DevicesRow devices={Object.values(devices) as any} recentlySettledIds={recentlySettledIds} />
    </div>
  );
}

