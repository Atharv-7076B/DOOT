import { useEffect, useMemo, useState } from 'react';
import { computePacketHash, decodePacketSegments } from '@/lib/packetCodec';

export function usePacketDecoding(ciphertextBase64: string | null) {
  const [hash, setHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  const segments = useMemo(
    () => (ciphertextBase64 ? decodePacketSegments(ciphertextBase64) : null),
    [ciphertextBase64],
  );

  useEffect(() => {
    if (!ciphertextBase64) {
      setHash(null);
      return;
    }
    let cancelled = false;
    setIsHashing(true);
    computePacketHash(ciphertextBase64)
      .then((value) => {
        if (!cancelled) setHash(value);
      })
      .finally(() => {
        if (!cancelled) setIsHashing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ciphertextBase64]);

  return { segments, hash, isHashing };
}
