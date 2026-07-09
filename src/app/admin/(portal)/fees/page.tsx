import { ComingSoon } from "@/components/admin/ComingSoon";

export const dynamic = "force-dynamic";

export default function FeesPage() {
  return (
    <ComingSoon
      title="Fees"
      note="Invoices, payments, pending dues and receipts arrive in Phase 3. The fees and payments tables already exist, and this module is feature-flagged off until then."
    />
  );
}
