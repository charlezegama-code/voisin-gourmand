function Pulse({ className = "" }: { className?: string }) {
  return <div className={`motion-safe:animate-pulse motion-reduce:opacity-60 rounded-xl bg-terracotta-100/70 ${className}`} />;
}

export function CookCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-terracotta-50">
      <Pulse className="h-36 w-full rounded-none" />
      <div className="space-y-2 p-3.5">
        <Pulse className="h-4 w-2/3" />
        <Pulse className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Pulse className="h-3 w-16" />
          <Pulse className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function CookCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <CookCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DishCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-terracotta-50">
      <Pulse className="h-16 w-16 shrink-0" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-3.5 w-3/4" />
        <Pulse className="h-3 w-1/2" />
      </div>
      <Pulse className="h-5 w-12" />
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="px-4">
      <Pulse className="h-64 w-full rounded-3xl" />
      <div className="mt-4 space-y-2">
        <Pulse className="h-5 w-1/2" />
        <Pulse className="h-3 w-1/3" />
      </div>
    </div>
  );
}
