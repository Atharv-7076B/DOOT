import { Database, Radio, ShieldCheck } from 'lucide-react';
import { CopyableField } from '@/components/molecules/CopyableField';
import type { PacketExplorerDto } from '@/types/api';

export function RedisTransportState({ packet }: { packet: PacketExplorerDto }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Packet Key in Redis */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border-soft bg-surface p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground">
              <Database className="h-3.5 w-3.5 text-mesh-cyan" />
              Redis Packet Key
            </span>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${
                packet.inRedis
                  ? 'bg-mesh-green/15 text-mesh-green border border-mesh-green/30'
                  : 'bg-surface-hover text-muted-foreground border border-border'
              }`}
            >
              {packet.inRedis ? 'ACTIVE IN REDIS' : 'CLEARED FROM MESH'}
            </span>
          </div>
          <div className="font-mono text-[11.5px] text-muted-foreground">{packet.redisPacketKey}</div>
        </div>

        {/* Processed/Replay Protection Status Key */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border-soft bg-surface p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-mesh-green" />
              Replay Protection Key
            </span>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${
                packet.processedInRedis
                  ? 'bg-mesh-green/15 text-mesh-green border border-mesh-green/30'
                  : 'bg-mesh-cyan/15 text-mesh-cyan border border-mesh-cyan/30'
              }`}
            >
              {packet.processedInRedis ? 'PROCESSED & CACHED' : 'MONITORING'}
            </span>
          </div>
          <div className="truncate font-mono text-[11.5px] text-muted-foreground">{packet.processedKey}</div>
        </div>
      </div>

      {/* Seen Nodes Array */}
      <div className="flex flex-col gap-2 rounded-lg border border-border-soft bg-surface p-3.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground">
            <Radio className="h-3.5 w-3.5 text-mesh-purple" />
            Seen Nodes (<code className="font-mono text-[10px]">seen:&lt;packetId&gt;:&lt;node&gt;</code>)
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {packet.seenNodes?.length ?? 0} node(s) recorded packet
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {packet.seenNodes && packet.seenNodes.length > 0 ? (
            packet.seenNodes.map((node) => (
              <div
                key={node}
                className="flex items-center gap-1.5 rounded-md border border-mesh-purple/30 bg-mesh-purple/10 px-2.5 py-1 font-mono text-xs font-medium text-mesh-purple"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-mesh-purple" />
                {node}
              </div>
            ))
          ) : (
            <span className="font-mono text-xs italic text-muted-foreground">No nodes recorded yet</span>
          )}
        </div>
      </div>

      <CopyableField label="Full Replay Key (24h TTL Cache)" value={packet.processedKey} />
    </div>
  );
}
