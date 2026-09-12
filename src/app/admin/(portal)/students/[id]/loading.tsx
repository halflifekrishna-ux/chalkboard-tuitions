import { PageLoader } from "@/components/admin/Loader";
import { Skeleton } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-5 max-w-2xl">
      <PageLoader label="Loading student…" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    </div>
  );
}
