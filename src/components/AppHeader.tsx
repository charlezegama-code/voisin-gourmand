interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header className="flex items-center gap-2.5 px-4 pb-1 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <img src="/icons/icon-64.png" alt="" className="h-8 w-8 rounded-lg" />
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-ink">{title}</h1>
        {subtitle && <p className="truncate text-xs text-ink/50">{subtitle}</p>}
      </div>
    </header>
  );
}
