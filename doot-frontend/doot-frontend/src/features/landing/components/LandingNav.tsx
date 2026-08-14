import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function LandingNav() {
  const navigate = useNavigate();

  return (
    <nav className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-7 md:px-8">
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-gradient-to-br from-mesh-blue to-mesh-purple shadow-glow">
          <div className="absolute inset-2 rounded-full bg-white/85" />
        </div>
        <span className="font-display text-[19px] font-bold tracking-tight">DOOT</span>
      </div>
      <div className="hidden gap-8 text-sm text-muted-foreground md:flex">
        <span>Architecture</span>
        <span>Simulator</span>
        <span>Docs</span>
      </div>
      <Button variant="ghost" onClick={() => navigate('/dashboard')}>
        Launch Simulator
      </Button>
    </nav>
  );
}
