import { PageLoader } from "@/components/admin/Loader";
import { Skeleton } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <PageLoader label="Loading today's sessions…" />
      <Skeleton className="h-24 w-full" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] w-full" />
        ))}
      </div>
    </div>
  );
}
