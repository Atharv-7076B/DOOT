import { cn } from '@/lib/utils';

export type StatusDotTone = 'green' | 'cyan' | 'amber' | 'red' | 'neutral';

interface StatusDotProps {
  tone?: StatusDotTone;
  pulse?: boolean;
  className?: string;
}

const TONE_CLASSES: Record<StatusDotTone, string> = {
  green: 'bg-mesh-green shadow-[0_0_6px_hsl(var(--mesh-green))]',
  cyan: 'bg-mesh-cyan shadow-[0_0_6px_hsl(var(--mesh-cyan))]',
  amber: 'bg-mesh-amber shadow-[0_0_6px_hsl(var(--mesh-amber))]',
  red: 'bg-mesh-red shadow-[0_0_6px_hsl(var(--mesh-red))]',
  neutral: 'bg-muted-foreground',
};

/** Never the only signal for a status — always pair with visible text (see Badge). */
export function StatusDot({ tone = 'green', pulse = true, className }: StatusDotProps) {
  return (
    <span
      className={cn('inline-block h-1.5 w-1.5 rounded-full', TONE_CLASSES[tone], pulse && 'animate-pulse-soft', className)}
      aria-hidden="true"
    />
  );
}
