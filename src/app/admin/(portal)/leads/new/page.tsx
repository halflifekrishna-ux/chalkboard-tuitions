import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { LeadForm } from "@/components/admin/LeadForm";
import { createLead } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewLeadPage() {
  await requireCapability("leads.create");

  return (
    <div className="space-y-5 max-w-xl">
      <header>
        <Link href="/admin/leads" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Leads
        </Link>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Add Lead</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          Pick the side of the business it belongs to — the lead routes itself from there.
        </p>
      </header>

      <LeadForm action={createLead} />
    </div>
  );
}
