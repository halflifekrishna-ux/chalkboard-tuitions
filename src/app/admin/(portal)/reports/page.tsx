import { requireCapability } from "@/lib/os/auth";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requireCapability("reports.view");
  return (
    <ComingSoon
      title="Reports"
      note="Weekly progress reports (attendance %, topics, homework, teacher remarks) built from session notes arrive in Phase 3. The data is already being captured."
    />
  );
}
