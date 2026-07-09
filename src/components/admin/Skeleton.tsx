/** Shimmer block. Compose these into route-level loading fallbacks. */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className ?? ""}`}
      style={{ background: "rgba(245,240,232,0.06)", ...style }}
    />
  );
}

/** A stack of card-shaped skeletons for list pages. */
export function ListSkeleton({ rows = 5, title = true }: { rows?: number; title?: boolean }) {
  return (
    <div className="space-y-5">
      {title && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-20" />
        </div>
      )}
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-[68px] w-full" />
        ))}
      </div>
    </div>
  );
}
