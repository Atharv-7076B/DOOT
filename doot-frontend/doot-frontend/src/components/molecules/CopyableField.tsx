import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CopyableFieldProps {
  label: string;
  value: string;
  monospaceWrap?: boolean;
}

export function CopyableField({ label, value, monospaceWrap = true }: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — silently no-op, value is still visible/selectable
    }
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-eyebrow">{label}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="h-3 w-3 text-mesh-green" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <p className={`rounded-md border border-border-soft bg-black/20 p-2.5 font-mono text-[10.5px] leading-relaxed text-muted-foreground ${monospaceWrap ? 'break-all' : 'truncate'}`}>
        {value}
      </p>
    </div>
  );
}
