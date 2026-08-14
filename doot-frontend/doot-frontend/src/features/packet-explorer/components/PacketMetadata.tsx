import { usePacketDecoding } from '@/features/packet-explorer/hooks/usePacketDecoding';
import { CopyableField } from '@/components/molecules/CopyableField';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimestamp } from '@/lib/format';
import type { FlatPacket } from '@/features/packet-explorer/hooks/usePacketExplorer';

export function PacketMetadata({ packet }: { packet: FlatPacket }) {
  const { segments, hash, isHashing } = usePacketDecoding(packet.ciphertext);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Packet ID" value={packet.packetId} />
        <Field label="Created" value={formatTimestamp(new Date(packet.createdAt))} />
        <Field label="Held by" value={`${packet.holderDeviceId}${packet.holderHasInternet ? ' (online)' : ''}`} />
      </div>

      <CopyableField label="SHA-256 Hash (idempotency key)" value={isHashing || !hash ? 'computing…' : hash} />
      {segments ? (
        <>
          <CopyableField label="Encrypted AES Key (RSA-OAEP, 256 bytes)" value={segments.rsaEncryptedAesKeyBase64} />
          <CopyableField label="IV (12 bytes)" value={segments.ivBase64} />
          <CopyableField label="AES-GCM Ciphertext + Tag" value={segments.aesCiphertextAndTagBase64} />
        </>
      ) : (
        <Skeleton className="h-20 w-full" />
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-eyebrow mb-1">{label}</div>
      <div className="truncate font-mono text-[11.5px]">{value}</div>
    </div>
  );
}
