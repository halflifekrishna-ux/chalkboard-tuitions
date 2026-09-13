import { PageLoader } from "@/components/admin/Loader";
import { Skeleton } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-3 max-w-2xl">
      <PageLoader label="Loading roster…" />
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    </div>
  );
}
