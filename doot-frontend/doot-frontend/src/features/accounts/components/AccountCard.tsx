import { motion, useReducedMotion } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DeviceAvatar } from '@/components/atoms/DeviceAvatar';
import { formatCurrency } from '@/lib/format';
import type { AccountDto } from '@/types/api';

interface AccountCardProps {
  account: AccountDto;
  /** highest balance across all accounts — the bar is relative to this, not absolute */
  maxBalance: number;
}

const ACCENTS = ['blue', 'cyan', 'purple', 'green'] as const;

export function AccountCard({ account, maxBalance }: AccountCardProps) {
  const reduceMotion = useReducedMotion();
  const accent = ACCENTS[account.id % ACCENTS.length] ?? 'blue';
  const ratio = maxBalance > 0 ? Math.max(4, (account.balance / maxBalance) * 100) : 0;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DeviceAvatar device={{ name: account.holderName, accent, isBridge: false }} />
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold">{account.holderName}</div>
            <div className="truncate font-mono text-[11px] text-muted-foreground">{account.vpa}</div>
          </div>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1 rounded-full border border-border-soft bg-surface px-2 py-1 font-mono text-[10px] text-muted-foreground">
              <GitBranch className="h-3 w-3" aria-hidden="true" />v{account.version}
            </span>
          </TooltipTrigger>
          <TooltipContent>Optimistic-lock version — increments on every settled write.</TooltipContent>
        </Tooltip>
      </div>

      <div>
        <div className="mb-2 font-display text-[22px] font-semibold tracking-tight">
          {formatCurrency(account.balance)}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover" role="img" aria-label={`Balance relative to the largest account balance: ${Math.round(ratio)}%`}>
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-mesh-blue to-mesh-cyan"
            initial={reduceMotion ? { width: `${ratio}%` } : { width: 0 }}
            animate={{ width: `${ratio}%` }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </Card>
  );
}
