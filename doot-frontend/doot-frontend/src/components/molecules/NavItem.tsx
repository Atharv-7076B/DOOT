import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
}

export function NavItem({ icon: Icon, label, to }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isActive &&
            'border border-mesh-blue/30 bg-gradient-to-br from-mesh-blue/15 to-mesh-purple/10 text-foreground',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  );
}
