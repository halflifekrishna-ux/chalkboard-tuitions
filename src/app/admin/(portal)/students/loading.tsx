import { PageLoader } from "@/components/admin/Loader";
import { ListSkeleton } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <PageLoader label="Loading students…" />
      <ListSkeleton rows={6} title={false} />
    </div>
  );
}
