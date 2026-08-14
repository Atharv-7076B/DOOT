import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-mono text-[10px] tracking-wide px-2.5 py-1 border',
  {
    variants: {
      variant: {
        neutral: 'bg-surface border-border text-muted-foreground',
        online: 'bg-mesh-green/10 border-mesh-green/30 text-mesh-green',
        relaying: 'bg-mesh-cyan/10 border-mesh-cyan/30 text-mesh-cyan',
        warning: 'bg-mesh-amber/10 border-mesh-amber/30 text-mesh-amber',
        danger: 'bg-mesh-red/10 border-mesh-red/30 text-mesh-red',
        info: 'bg-mesh-blue/10 border-mesh-blue/30 text-mesh-blue',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
