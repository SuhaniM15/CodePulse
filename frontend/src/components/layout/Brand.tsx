export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/favicon.svg" alt="" width={28} height={28} className="size-7 shrink-0" />
      <div className="leading-tight">
        <p className="m-0 text-base font-semibold">CodePulse</p>
        <p className="m-0 text-xs text-muted-foreground">Decision support for code review</p>
      </div>
    </div>
  );
}
