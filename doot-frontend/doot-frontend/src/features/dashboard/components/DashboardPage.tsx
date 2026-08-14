import { Waypoints, ScrollText, Link2 } from 'lucide-react';
import { Topbar, StatusPill } from '@/app/layout/Topbar';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    relayingDeviceIds,
    recentlySettledIds,
    metrics,
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
        title="Simulator Dashboard"
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
          <CardHeader>
            <CardTitle>
              <Waypoints className="h-4 w-4 text-mesh-cyan" aria-hidden="true" />
              Mesh Network
            </CardTitle>
            <CardDescription>4 nodes · 5 links</CardDescription>
          </CardHeader>
          <MeshGraph devices={devices} relayingDeviceIds={relayingDeviceIds} animatedPackets={animatedPackets} />
        </Card>

        <div className="flex flex-col gap-3.5">
          <Card className="p-5">
            <CardHeader>
              <CardTitle>
                <ScrollText className="h-4 w-4 text-mesh-blue" aria-hidden="true" />
                Live Activity Log
              </CardTitle>
              <CardDescription>real-time</CardDescription>
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
          <CardDescription>{queue.length} pending</CardDescription>
        </CardHeader>
        <PacketQueue packets={queue} />
      </Card>

      <DevicesRow devices={Object.values(devices)} recentlySettledIds={recentlySettledIds} />
    </div>
  );
}
