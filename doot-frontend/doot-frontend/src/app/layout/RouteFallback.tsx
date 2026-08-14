export function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-2.5 font-mono text-xs text-muted-foreground">
        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-mesh-blue" />
        Loading DOOT…
      </div>
    </div>
  );
}
