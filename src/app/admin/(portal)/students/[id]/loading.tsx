import { Skeleton } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16" style={{ borderRadius: "9999px" }} />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
