// README ("Problem 1: Untrusted intermediates"):
// ciphertext = [256 bytes RSA-encrypted AES key][12 bytes IV][AES ciphertext + 16-byte GCM tag]
const RSA_KEY_BYTES = 256;
const IV_BYTES = 12;

export interface DecodedPacketSegments {
  rsaEncryptedAesKeyBase64: string;
  ivBase64: string;
  aesCiphertextAndTagBase64: string;
  totalBytes: number;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

/** Splits the base64 ciphertext blob into its three documented segments. Pure, no I/O. */
export function decodePacketSegments(ciphertextBase64: string): DecodedPacketSegments {
  const bytes = base64ToBytes(ciphertextBase64);
  const rsaSegment = bytes.slice(0, RSA_KEY_BYTES);
  const ivSegment = bytes.slice(RSA_KEY_BYTES, RSA_KEY_BYTES + IV_BYTES);
  const aesSegment = bytes.slice(RSA_KEY_BYTES + IV_BYTES);

  return {
    rsaEncryptedAesKeyBase64: bytesToBase64(rsaSegment),
    ivBase64: bytesToBase64(ivSegment),
    aesCiphertextAndTagBase64: bytesToBase64(aesSegment),
    totalBytes: bytes.length,
  };
}

/**
 * SHA-256 of the raw ciphertext bytes, matching the backend's idempotency key
 * (README: "Hash the ciphertext (SHA-256)"). Uses the Web Crypto API.
 */
export async function computePacketHash(ciphertextBase64: string): Promise<string> {
  const bytes = base64ToBytes(ciphertextBase64);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
