import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Archive, Users, BookOpen } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { EnrolmentList, type EnrolCandidate } from "@/components/admin/EnrolmentList";
import { BatchSubjectManager, type BatchSubjectRow } from "@/components/admin/BatchSubjectManager";
import { Tabs } from "@/components/admin/Tabs";
import { BOARD_LABELS, type Board } from "@/lib/os/types";
import { fmtTime } from "@/lib/os/attendance";
import { archiveBatch, setBatchEnrolment, addBatchSubject, updateBatchSubject, archiveBatchSubject } from "../actions";

export const dynamic = "force-dynamic";

export default async function BatchDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();

  const { data: batch } = await supabase
    .from("batches")
    .select("*, academic_year:academic_years(name)")
    .eq("id", params.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!batch) notFound();

  const [{ data: allStudents }, { data: enrolled }, { data: batchSubjects }, { data: subjects }, { data: recentSessions }] = await Promise.all([
    supabase.from("students").select("id, full_name, admission_number, grade").is("deleted_at", null).in("status", ["active", "trial", "paused"]).order("full_name"),
    supabase.from("batch_students").select("student_id").eq("batch_id", params.id),
    supabase.from("batch_subjects").select("id, subject_id, days, start_time, end_time, room, colour, status, subject:subjects(name), teacher:teachers(full_name)").eq("batch_id", params.id).is("deleted_at", null).order("start_time"),
    supabase.from("subjects").select("id, name").eq("is_active", true).order("name"),
    supabase.from("sessions").select("id, session_date, start_time, status, batch_subject:batch_subjects!inner(batch_id, subject:subjects(name)), attendance(count)").eq("batch_subject.batch_id", params.id).order("session_date", { ascending: false }).limit(20),
  ]);

  const enrolledIds = new Set((enrolled ?? []).map((e) => e.student_id));
  const candidates: EnrolCandidate[] = (allStudents ?? []).map((s) => ({
    id: s.id, full_name: s.full_name, admission_number: s.admission_number, grade: s.grade, enrolled: enrolledIds.has(s.id),
  }));

  const subjectRows: BatchSubjectRow[] = (batchSubjects ?? []).map((bs) => {
    const subject = bs.subject as unknown as { name: string } | null;
    const teacher = bs.teacher as unknown as { full_name: string } | null;
    return { id: bs.id, subject_id: bs.subject_id, subject_name: subject?.name ?? "—", teacher_name: teacher?.full_name ?? null, days: bs.days ?? [], start_time: bs.start_time, end_time: bs.end_time, room: bs.room, colour: bs.colour, status: bs.status };
  });

  const ay = batch.academic_year as unknown as { name: string } | null;
  const archiveWithId = archiveBatch.bind(null, params.id);

  async function toggleEnrol(studentId: string, enrol: boolean) {
    "use server";
    await setBatchEnrolment(params.id, studentId, enrol);
  }
  const addSub = addBatchSubject.bind(null, params.id);
  async function updateSub(bsId: string, prev: { error?: string }, fd: FormData) {
    "use server";
    return updateBatchSubject(bsId, params.id, prev, fd);
  }
  async function archiveSub(bsId: string) {
    "use server";
    await archiveBatchSubject(bsId, params.id);
  }

  const overview = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <Users size={16} style={{ color: "#c9a227" }} />
          <p className="text-xs mt-1.5" style={{ color: "rgba(245,240,232,0.45)" }}>Enrolled</p>
          <p className="font-playfair text-xl font-bold" style={{ color: "#f5f0e8" }}>{enrolledIds.size}/{batch.capacity}</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <BookOpen size={16} style={{ color: "#c9a227" }} />
          <p className="text-xs mt-1.5" style={{ color: "rgba(245,240,232,0.45)" }}>Subjects</p>
          <p className="font-playfair text-xl font-bold" style={{ color: "#f5f0e8" }}>{subjectRows.length}</p>
        </div>
      </div>
      <div className="rounded-2xl px-4 divide-y" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
        {[
          ["Academic year", ay?.name ?? "—"],
          ["Grade", `Grade ${batch.grade}`],
          ["Board", batch.board ? BOARD_LABELS[batch.board as Board] : "Any"],
          ["Status", batch.status],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-2.5">
            <span className="text-xs" style={{ color: "rgba(245,240,232,0.45)" }}>{k}</span>
            <span className="text-sm font-medium capitalize" style={{ color: "#f5f0e8" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const attendanceTab = (
    <div className="rounded-2xl" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
      {!recentSessions?.length ? (
        <p className="p-5 text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>No sessions recorded yet for this batch.</p>
      ) : (
        <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
          {recentSessions.map((s) => {
            const bs = s.batch_subject as unknown as { subject: { name: string } | null } | null;
            const marked = (s.attendance as unknown as { count: number }[])?.[0]?.count ?? 0;
            return (
              <li key={s.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>{bs?.subject?.name ?? "Subject"}</p>
                  <p className="text-[11px]" style={{ color: "rgba(245,240,232,0.45)" }}>
                    {new Date(s.session_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {fmtTime(s.start_time)} · {marked} marked
                  </p>
                </div>
                <span className="text-[11px] font-bold capitalize" style={{ color: s.status === "completed" ? "#7dc98f" : "#f4c430" }}>{s.status.replace("_", " ")}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  const notesTab = (
    <div className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
      {batch.notes ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(245,240,232,0.8)" }}>{batch.notes}</p>
      ) : (
        <p className="text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>
          No notes. <Link href={`/admin/batches/${batch.id}/edit`} className="font-semibold" style={{ color: "#f4c430" }}>Add notes →</Link>
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <header>
        <Link href="/admin/batches" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Batches
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>{batch.name}</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
              Grade {batch.grade}{batch.board ? ` · ${BOARD_LABELS[batch.board as Board]}` : ""} · {ay?.name} · {batch.status}
            </p>
          </div>
          <Link href={`/admin/batches/${batch.id}/edit`} className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm whitespace-nowrap" style={{ background: "rgba(201,162,39,0.15)", color: "#f4c430", border: "1px solid rgba(201,162,39,0.3)" }}>
            <Pencil size={14} /> Edit
          </Link>
        </div>
      </header>

      <Tabs
        tabs={[
          { key: "overview", label: "Overview", content: overview },
          { key: "students", label: "Students", badge: enrolledIds.size, content: candidates.length === 0 ? <p className="rounded-2xl p-5 text-sm" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)", color: "rgba(245,240,232,0.45)" }}>No active students yet.</p> : <EnrolmentList students={candidates} onToggle={toggleEnrol} /> },
          { key: "subjects", label: "Subjects", badge: subjectRows.length, content: <BatchSubjectManager subjects={subjects ?? []} rows={subjectRows} addAction={addSub} updateAction={updateSub} archiveAction={archiveSub} /> },
          { key: "attendance", label: "Attendance", content: attendanceTab },
          { key: "notes", label: "Notes", content: notesTab },
        ]}
      />

      <form action={archiveWithId} className="pt-2 pb-6">
        <button type="submit" className="flex items-center gap-2 text-xs font-semibold" style={{ color: "rgba(232,160,144,0.8)" }}>
          <Archive size={14} /> Archive batch
        </button>
      </form>
    </div>
  );
}
