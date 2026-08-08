export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-neutral-200" />
      <div className="mt-6 space-y-3 flex flex-col items-center">
        <div className="h-4 w-3/4 bg-neutral-200 rounded-sm" />
        <div className="h-3 w-1/3 bg-neutral-200 rounded-sm" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
