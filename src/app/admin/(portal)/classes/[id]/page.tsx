import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Archive, Clock, MapPin, Users, ClipboardCheck } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { EnrolmentList, type EnrolCandidate } from "@/components/admin/EnrolmentList";
import { archiveClass, setEnrolment } from "../actions";

export const dynamic = "force-dynamic";

function fmtTime(t: string | null) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default async function ClassDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();

  const { data: cls } = await supabase
    .from("classes")
    .select("*, subject:subjects(name), teacher:teachers(full_name)")
    .eq("id", params.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!cls) notFound();

  const [{ data: allStudents }, { data: enrolled }] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name, admission_number, grade")
      .is("deleted_at", null)
      .in("status", ["active", "trial", "paused"])
      .order("full_name"),
    supabase.from("class_students").select("student_id").eq("class_id", params.id),
  ]);

  const enrolledIds = new Set((enrolled ?? []).map((e) => e.student_id));
  const candidates: EnrolCandidate[] = (allStudents ?? []).map((s) => ({
    id: s.id,
    full_name: s.full_name,
    admission_number: s.admission_number,
    grade: s.grade,
    enrolled: enrolledIds.has(s.id),
  }));

  const subject = cls.subject as unknown as { name: string } | null;
  const teacher = cls.teacher as unknown as { full_name: string } | null;
  const archiveWithId = archiveClass.bind(null, params.id);

  async function toggle(studentId: string, enrol: boolean) {
    "use server";
    await setEnrolment(params.id, studentId, enrol);
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <header>
        <Link href="/admin/classes" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Classes
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>
              {cls.name}
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
              {subject?.name ?? "—"} · Grade {cls.grade}
              {teacher ? ` · ${teacher.full_name}` : ""}
            </p>
          </div>
          <Link
            href={`/admin/classes/${cls.id}/edit`}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm whitespace-nowrap"
            style={{ background: "rgba(201,162,39,0.15)", color: "#f4c430", border: "1px solid rgba(201,162,39,0.3)" }}
          >
            <Pencil size={14} /> Edit
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-3.5" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <Clock size={16} style={{ color: "#c9a227" }} />
          <p className="text-xs mt-1.5" style={{ color: "rgba(245,240,232,0.45)" }}>Time</p>
          <p className="text-sm font-semibold" style={{ color: "#f5f0e8" }}>{fmtTime(cls.start_time)}</p>
        </div>
        <div className="rounded-2xl p-3.5" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <Users size={16} style={{ color: "#c9a227" }} />
          <p className="text-xs mt-1.5" style={{ color: "rgba(245,240,232,0.45)" }}>Capacity</p>
          <p className="text-sm font-semibold" style={{ color: "#f5f0e8" }}>{enrolledIds.size}/{cls.capacity}</p>
        </div>
        <div className="rounded-2xl p-3.5" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <MapPin size={16} style={{ color: "#c9a227" }} />
          <p className="text-xs mt-1.5" style={{ color: "rgba(245,240,232,0.45)" }}>Room</p>
          <p className="text-sm font-semibold" style={{ color: "#f5f0e8" }}>{cls.room ?? "—"}</p>
        </div>
      </div>

      <Link
        href={`/admin/attendance/${cls.id}`}
        className="flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-sm active:scale-[0.98] transition-transform"
        style={{ background: "#c9a227", color: "#162d24" }}
      >
        <ClipboardCheck size={17} /> Take Attendance
      </Link>

      <section>
        <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>
          Enrolment
        </h2>
        {candidates.length === 0 ? (
          <p className="rounded-2xl p-5 text-sm" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)", color: "rgba(245,240,232,0.45)" }}>
            No active students yet. Add students first, then enrol them here.
          </p>
        ) : (
          <EnrolmentList students={candidates} onToggle={toggle} />
        )}
      </section>

      <form action={archiveWithId} className="pt-2 pb-6">
        <button type="submit" className="flex items-center gap-2 text-xs font-semibold" style={{ color: "rgba(232,160,144,0.8)" }}>
          <Archive size={14} /> Archive class
        </button>
      </form>
    </div>
  );
}
