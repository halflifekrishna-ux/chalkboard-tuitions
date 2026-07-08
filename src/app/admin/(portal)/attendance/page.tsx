import { ComingSoon } from "@/components/admin/ComingSoon";

export const dynamic = "force-dynamic";

export default function AttendancePage() {
  return (
    <ComingSoon
      title="Attendance"
      note="Session-based attendance with large touch buttons and automatic WhatsApp updates arrives in Phase 2. The database is already ready for it."
    />
  );
}
