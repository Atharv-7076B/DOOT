import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HopRouteProps {
  hopCount: number;
  bridgeNodeId: string;
}

export function HopRoute({ hopCount, bridgeNodeId }: HopRouteProps) {
  const relayDots = Array.from({ length: hopCount });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex items-center gap-1"
          role="img"
          aria-label={`Relayed through ${hopCount} intermediate hop${hopCount === 1 ? '' : 's'} before reaching bridge ${bridgeNodeId}`}
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-mesh-blue" aria-hidden="true" />
          {relayDots.map((_, i) => (
            <span key={i} className="flex items-center" aria-hidden="true">
              <span className="h-px w-2.5 bg-border" />
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mesh-cyan/70" />
            </span>
          ))}
          <span className="h-px w-2.5 bg-border" aria-hidden="true" />
          <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-mesh-green bg-mesh-green/20" aria-hidden="true" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {hopCount} hop{hopCount === 1 ? '' : 's'} → bridge {bridgeNodeId}
      </TooltipContent>
    </Tooltip>
  );
}
