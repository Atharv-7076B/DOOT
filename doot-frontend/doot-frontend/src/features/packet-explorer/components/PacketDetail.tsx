import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EncryptionLifecycle } from '@/features/packet-explorer/components/EncryptionLifecycle';
import { TtlHopGauge } from '@/features/packet-explorer/components/TtlHopGauge';
import { SecurityInfoCard } from '@/features/packet-explorer/components/SecurityInfoCard';
import { RedisTransportState } from '@/features/packet-explorer/components/RedisTransportState';
import { formatTimestamp } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PacketExplorerDto } from '@/types/api';

export function PacketDetail({ packet }: { packet: PacketExplorerDto }) {
  return (
    <motion.div
      key={packet.packetId}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-4"
    >
      {/* 1. Quick Stats Header & Selected Packet Summary */}
      <Card className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-eyebrow mb-1">Selected Packet</div>
              <h2 className="font-mono text-lg font-bold text-foreground">{packet.packetId}</h2>
            </div>
            <span
              className={cn(
                'rounded-full px-3 py-1 font-mono text-xs font-semibold tracking-wider uppercase',
                getStatusStyle(packet.status),
              )}
            >
              {packet.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Current Node" value={packet.currentNode} />
            <Field label="Hop Count" value={`${packet.hopCount} hop(s)`} />
            <Field label="TTL Remaining" value={`${packet.ttl}`} />
            <Field label="Bridge Node" value={packet.bridgeNodeId || (packet.currentNode === 'bridge' ? 'bridge' : 'N/A')} />
            <Field label="Created At" value={formatTimestamp(new Date(packet.createdAt))} />
            <div className="col-span-2 sm:col-span-3">
              <div className="text-eyebrow mb-1">Route / Visited Nodes</div>
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {packet.visitedNodes && packet.visitedNodes.length > 0 ? (
                  packet.visitedNodes.map((node, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-muted-foreground/40">→</span>}
                      <span className="rounded bg-surface-hover px-2 py-0.5 font-medium text-foreground">
                        {node}
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="italic text-muted-foreground">{packet.currentNode}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. 7-Stage Packet Lifecycle */}
      <Card className="p-5">
        <CardHeader>
          <CardTitle>Packet Lifecycle</CardTitle>
          <CardDescription>7-step flow from client creation to bridge ledger settlement</CardDescription>
        </CardHeader>
        <EncryptionLifecycle lifecycleStep={packet.lifecycleStep} status={packet.status} />
      </Card>

      {/* 3. Security Information */}
      <Card className="p-5">
        <CardHeader>
          <CardTitle>Security Information</CardTitle>
          <CardDescription>Hybrid RSA-2048 OAEP + AES-256-GCM cipher status</CardDescription>
        </CardHeader>
        <SecurityInfoCard packet={packet} />
      </Card>

      {/* 4. TTL & Hop Budget */}
      <Card className="p-5">
        <CardHeader>
          <CardTitle>TTL &amp; Hop Budget</CardTitle>
        </CardHeader>
        <TtlHopGauge ttl={packet.ttl} hopCount={packet.hopCount} />
      </Card>

      {/* 5. Redis / Transport State */}
      <Card className="p-5">
        <CardHeader>
          <CardTitle>Redis &amp; Transport State</CardTitle>
          <CardDescription>Live key status, seen node sets, and replay protection cache</CardDescription>
        </CardHeader>
        <RedisTransportState packet={packet} />
      </Card>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-eyebrow mb-1">{label}</div>
      <div className="truncate font-mono text-[11.5px] font-medium text-foreground">{value}</div>
    </div>
  );
}

function getStatusStyle(status: string) {
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
