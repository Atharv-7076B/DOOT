import { Smartphone, Radio, IndianRupee, Shuffle } from 'lucide-react';
import { MetricCard } from '@/components/molecules/MetricCard';
import { formatCurrency } from '@/lib/format';
import type { NetworkMetrics } from '@/types/network';

export function MetricsRow({ metrics }: { metrics: NetworkMetrics }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      <MetricCard
        icon={Smartphone}
        iconClassName="bg-mesh-blue/15 text-mesh-blue"
        trend={`${metrics.activeDeviceCount} active`}
        value={String(metrics.activeDeviceCount)}
        label="Virtual devices online"
      />
      <MetricCard
        icon={Radio}
        iconClassName="bg-mesh-cyan/15 text-mesh-cyan"
        value={String(metrics.packetsInTransit)}
        label="Packets in transit"
      />
      <MetricCard
        icon={IndianRupee}
        iconClassName="bg-mesh-purple/15 text-mesh-purple"
        value={formatCurrency(metrics.totalVolumeRouted)}
        label="Total volume routed"
      />
      <MetricCard
        icon={Shuffle}
        iconClassName="bg-mesh-green/15 text-mesh-green"
        trend={`TTL ${5}`}
        value={metrics.averageHopCount.toFixed(1)}
        label="Avg hop count"
      />
    </div>
  );
}
