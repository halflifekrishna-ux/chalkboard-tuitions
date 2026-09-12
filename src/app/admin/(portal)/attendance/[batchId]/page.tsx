import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { signedUrl, PHOTO_BUCKET } from "@/lib/os/storage";
import { isoDate, fmtTime, type AttendanceStatus } from "@/lib/os/attendance";
import { AttendanceScreen, type RosterStudent } from "@/components/admin/AttendanceScreen";
import { finishSession } from "../actions";

export const dynamic = "force-dynamic";

export default async function MarkAttendancePage({
  params,
  searchParams,
}: {
  params: { batchId: string };
  searchParams: { date?: string };
}) {
  await requireCapability("attendance.mark");
  const supabase = createServerSupabase();
  const day = searchParams.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date) ? searchParams.date : isoDate(new Date());

  const { data: batch } = await supabase
    .from("batches")
    .select("id, name, grade, start_time, end_time, room")
    .eq("id", params.batchId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!batch) notFound();

  const { data: batchSubjects } = await supabase
    .from("batch_subjects")
    .select("id, subject_id, colour, subject:subjects(name), teacher:teachers(full_name)")
    .eq("batch_id", batch.id)
    .eq("status", "active")
    .is("deleted_at", null);

  const subjectOptions = (batchSubjects ?? []).map((bs) => ({
    id: bs.subject_id as string,
    name: (bs.subject as unknown as { name: string } | null)?.name ?? "—",
    teacherName: (bs.teacher as unknown as { full_name: string } | null)?.full_name ?? null,
    colour: bs.colour as string,
  }));

  // Roster = students enrolled in the batch (lazy: only ids first, then details).
  const { data: enrol } = await supabase
    .from("batch_students")
    .select("student:students(id, full_name, admission_number, photo_path, status)")
    .eq("batch_id", batch.id);

  const students = (enrol ?? [])
    .map((e) => e.student as unknown as { id: string; full_name: string; admission_number: string | null; photo_path: string | null; status: string } | null)
    .filter((s): s is NonNullable<typeof s> => !!s && s.status !== "archived" && s.status !== "dropped")
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  // Existing session + marks for this date (resume / edit).
  const { data: session } = await supabase
    .from("sessions")
    .select("id, status, subject_ids, topic_covered, homework_assigned, teacher_notes")
    .eq("batch_id", params.batchId)
    .eq("session_date", day)
    .maybeSingle();

  const existingMarks = session
    ? (await supabase.from("attendance").select("student_id, status").eq("session_id", session.id)).data ?? []
    : [];
  const markByStudent = new Map(existingMarks.map((m) => [m.student_id, m.status as AttendanceStatus]));

  const photoUrls = await Promise.all(students.map((s) => signedUrl(PHOTO_BUCKET, s.photo_path)));

  const roster: RosterStudent[] = students.map((s, i) => ({
    id: s.id,
    full_name: s.full_name,
    admission_number: s.admission_number,
    photoUrl: photoUrls[i],
    status: markByStudent.get(s.id) ?? "present", // Present pre-selected
  }));

  const today = isoDate(new Date());
  const initialSubjectIds = session?.subject_ids?.length ? session.subject_ids : subjectOptions.map((s) => s.id);

  return (
    <div className="max-w-2xl">
      <header className="mb-4">
        <Link href={`/admin/attendance${day !== today ? `?date=${day}` : ""}`} className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Today&apos;s Sessions
        </Link>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-bold" style={{ color: "#f4c430" }}>{fmtTime(batch.start_time)}</span>
          <h1 className="font-playfair text-2xl font-bold" style={{ color: "#f5f0e8" }}>{batch.name}</h1>
        </div>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          Grade {batch.grade}{batch.room ? ` · ${batch.room}` : ""} · {new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
          {session?.status === "completed" && " · completed (editing)"}
        </p>
      </header>

      {roster.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <p className="text-sm mb-4" style={{ color: "rgba(245,240,232,0.5)" }}>No students enrolled in this batch yet.</p>
          <Link href={`/admin/batches/${batch.id}`} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>Enrol Students</Link>
        </div>
      ) : (
        <AttendanceScreen
          batchId={batch.id}
          sessionDate={day}
          startTime={batch.start_time?.slice(0, 5) ?? null}
          endTime={batch.end_time?.slice(0, 5) ?? null}
          roster={roster}
          subjectOptions={subjectOptions}
          initialSubjectIds={initialSubjectIds}
          existingNotes={{ topic: session?.topic_covered ?? "", homework: session?.homework_assigned ?? "", teacherNotes: session?.teacher_notes ?? "" }}
          alreadyCompleted={session?.status === "completed"}
          finishAction={finishSession}
        />
      )}
    </div>
  );
}
