import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { ClassScheduler } from "@/components/admin/ClassScheduler";

export const dynamic = "force-dynamic";

export default async function NewClassPage() {
  await requireCapability("batches.manage");
  const supabase = createServerSupabase();

  const [{ data: years }, { data: students }, { data: subjects }] = await Promise.all([
    supabase.from("academic_years").select("id, name").order("is_current", { ascending: false }).order("name", { ascending: false }),
    supabase.from("students").select("id, full_name, admission_number, grade").is("deleted_at", null).in("status", ["active", "trial", "paused"]).order("full_name"),
    supabase.from("subjects").select("id, name").eq("is_active", true).order("name"),
  ]);

  return (
    <div className="space-y-4 max-w-2xl">
      <header>
        <Link href="/admin/batches" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3 min-h-[32px]" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Classes
        </Link>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Schedule a class</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          Who&apos;s in it, when it repeats, what&apos;s taught. It appears in the Attendance calendar straight away.
        </p>
      </header>

      <ClassScheduler students={students ?? []} subjects={subjects ?? []} academicYearId={years?.[0]?.id ?? null} />
    </div>
  );
}
