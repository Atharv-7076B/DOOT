import { ShieldCheck, Lock, KeyRound, Copy, Check, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { CopyableField } from '@/components/molecules/CopyableField';
import { truncateHash } from '@/lib/format';
import type { PacketExplorerDto } from '@/types/api';

export function SecurityInfoCard({ packet }: { packet: PacketExplorerDto }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCiphertext = () => {
    if (packet.ciphertext) {
      navigator.clipboard.writeText(packet.ciphertext);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Security Properties Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-border-soft bg-surface-hover/50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-mesh-cyan/10 text-mesh-cyan">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Payload Encryption</div>
            <div className="font-mono text-xs font-semibold text-foreground">{packet.encryption || 'AES-256-GCM'}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-border-soft bg-surface-hover/50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-mesh-purple/10 text-mesh-purple">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Key Wrapping</div>
            <div className="font-mono text-xs font-semibold text-foreground">{packet.keyWrapping || 'RSA-2048 OAEP'}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-border-soft bg-surface-hover/50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-mesh-green/10 text-mesh-green">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Replay Protection</div>
            <div className="font-mono text-xs font-semibold text-foreground">{packet.replayProtectionStatus}</div>
          </div>
        </div>
      </div>

      {/* Ciphertext Preview & Hash */}
      <div className="flex flex-col gap-3 rounded-lg border border-border-soft bg-surface p-3.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold text-foreground">Ciphertext Preview (Truncated Base64)</span>
          <button
            type="button"
            onClick={handleCopyCiphertext}
            className="flex items-center gap-1 font-mono text-[10px] text-mesh-cyan hover:underline"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy Ciphertext'}
          </button>
        </div>

        <div className="rounded border border-border bg-background p-2.5 font-mono text-[11px] break-all text-muted-foreground">
          {packet.ciphertext ? truncateHash(packet.ciphertext, 24, 24) : 'N/A'}
        </div>

        <CopyableField label="SHA-256 Ciphertext Hash (Idempotency Key)" value={packet.packetHash} />
      </div>

      {/* Safety Notice Guarantee */}
      <div className="flex items-center gap-2.5 rounded-lg border border-mesh-amber/30 bg-mesh-amber/10 p-3 text-mesh-amber">
        <EyeOff className="h-4 w-4 shrink-0" />
        <p className="text-[11px] font-medium leading-relaxed">
          Zero-Knowledge Privacy: Relaying mesh nodes handle opaque ciphertext only. Decrypted PINs and payment secrets are never stored, logged, or exposed in frontend state.
        </p>
      </div>
    </div>
  );
}
