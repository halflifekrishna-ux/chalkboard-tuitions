import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { ClassForm } from "@/components/admin/ClassForm";
import { createClass } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewClassPage() {
  const supabase = createServerSupabase();
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-5 max-w-xl">
      <header>
        <Link href="/admin/classes" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Classes
        </Link>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>
          Add Class
        </h1>
      </header>

      <ClassForm action={createClass} subjects={subjects ?? []} submitLabel="Create Class" />
    </div>
  );
}
