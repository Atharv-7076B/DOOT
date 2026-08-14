import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EncryptionLifecycle } from '@/features/packet-explorer/components/EncryptionLifecycle';
import { TtlHopGauge } from '@/features/packet-explorer/components/TtlHopGauge';
import { PacketMetadata } from '@/features/packet-explorer/components/PacketMetadata';
import { truncateHash } from '@/lib/format';
import type { FlatPacket } from '@/features/packet-explorer/hooks/usePacketExplorer';

export function PacketDetail({ packet }: { packet: FlatPacket }) {
  return (
    <motion.div
      key={packet.packetId}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-4"
    >
      <Card className="p-5">
        <CardHeader>
          <CardTitle>Encryption Lifecycle</CardTitle>
          <CardDescription>{truncateHash(packet.packetId, 8, 6)}</CardDescription>
        </CardHeader>
        <EncryptionLifecycle heldByBridge={packet.holderHasInternet} />
      </Card>

      <Card className="p-5">
        <CardHeader>
          <CardTitle>TTL &amp; Hop Budget</CardTitle>
        </CardHeader>
        <TtlHopGauge ttl={packet.ttl} hopCount={packet.hopCount} />
      </Card>

      <Card className="p-5">
        <CardHeader>
          <CardTitle>Packet Metadata</CardTitle>
        </CardHeader>
        <PacketMetadata packet={packet} />
      </Card>
    </motion.div>
  );
}
