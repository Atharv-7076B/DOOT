import { Progress } from '@/components/ui/progress';
import { ConnectivityBadge } from '@/components/molecules/ConnectivityBadge';
import { formatCountdown } from '@/lib/format';
import type { SettlementState } from '@/types/network';

export function SettlementPanel({ state }: { state: SettlementState }) {
  const progressPercent = ((state.batchIntervalSeconds - state.secondsUntilNextBatch) / state.batchIntervalSeconds) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-[12.5px] text-muted-foreground">
        <span>Next settlement batch</span>
        <span className="font-mono text-foreground">{formatCountdown(state.secondsUntilNextBatch)}</span>
      </div>
      <Progress value={progressPercent} aria-label="Time until next settlement batch" />
      <div className="flex items-center justify-between text-[12.5px] text-muted-foreground">
        <span>Bridge node</span>
        <ConnectivityBadge connectivity="online" label="online" />
      </div>
      <div className="flex items-center justify-between text-[12.5px] text-muted-foreground">
        <span>Queued for settlement</span>
        <span className="font-mono text-foreground">{state.queuedForSettlement}</span>
      </div>
    </div>
  );
}
