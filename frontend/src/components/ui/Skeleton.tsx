/**
 * CSS-only loading placeholders for trading routes (no Framer Motion).
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer relative overflow-hidden rounded-card bg-line/60 ${className}`}
      aria-hidden
    />
  );
}

export function MarketCardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-card p-4 md:p-6">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="mt-4 h-3 w-full rounded-full" />
      <Skeleton className="mt-3 h-4 w-1/2" />
    </div>
  );
}
