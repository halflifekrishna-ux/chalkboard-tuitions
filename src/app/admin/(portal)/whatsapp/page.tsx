import { ComingSoon } from "@/components/admin/ComingSoon";

export const dynamic = "force-dynamic";

export default function WhatsAppPage() {
  return (
    <ComingSoon
      title="WhatsApp"
      note="Meta WhatsApp Cloud API integration — automated attendance updates to parents with full message logs — arrives in Phase 2. Every outgoing message will be recorded in whatsapp_logs."
    />
  );
}
