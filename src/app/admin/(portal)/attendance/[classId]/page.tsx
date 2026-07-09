import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { signedUrl, PHOTO_BUCKET } from "@/lib/os/storage";
import { weekdayKey, isoDate, fmtTime, type AttendanceStatus } from "@/lib/os/attendance";
import { AttendanceScreen, type RosterStudent } from "@/components/admin/AttendanceScreen";
import { finishClass } from "../actions";

export const dynamic = "force-dynamic";

export default async function TakeAttendancePage({ params }: { params: { classId: string } }) {
  const supabase = createServerSupabase();
  const now = new Date();
  const today = isoDate(now);

  const { data: cls } = await supabase
    .from("classes")
    .select("id, name, grade, start_time, subject:subjects(name), teacher:teachers(full_name)")
    .eq("id", params.classId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!cls) notFound();

  // Enrolled students (roster).
  const { data: enrol } = await supabase
    .from("class_students")
    .select("student:students(id, full_name, admission_number, photo_path, status)")
    .eq("class_id", params.classId);

  const students = (enrol ?? [])
    .map((e) => e.student as unknown as { id: string; full_name: string; admission_number: string | null; photo_path: string | null; status: string } | null)
    .filter((s): s is NonNullable<typeof s> => !!s && s.status !== "archived" && s.status !== "dropped")
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  // Existing session + marks today (edit mode / resume).
  const { data: session } = await supabase
    .from("class_sessions")
    .select("id, status, topic_covered, homework_assigned, teacher_notes")
    .eq("class_id", params.classId)
    .eq("session_date", today)
    .maybeSingle();

  const existingMarks = session
    ? (await supabase.from("attendance").select("student_id, status").eq("session_id", session.id)).data ?? []
    : [];
  const markByStudent = new Map(existingMarks.map((m) => [m.student_id, m.status as AttendanceStatus]));

  // Signed photo URLs (parallel).
  const photoUrls = await Promise.all(students.map((s) => signedUrl(PHOTO_BUCKET, s.photo_path)));

  const roster: RosterStudent[] = students.map((s, i) => ({
    id: s.id,
    full_name: s.full_name,
    admission_number: s.admission_number,
    photoUrl: photoUrls[i],
    // Present pre-selected by default; existing marks win on resume/edit.
    status: markByStudent.get(s.id) ?? "present",
  }));

  const subject = cls.subject as unknown as { name: string } | null;
  const teacher = cls.teacher as unknown as { full_name: string } | null;

  return (
    <div className="max-w-2xl">
      <header className="mb-4">
        <Link href="/admin/attendance" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Today&apos;s Classes
        </Link>
        <h1 className="font-playfair text-2xl font-bold" style={{ color: "#f5f0e8" }}>{cls.name}</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          {subject?.name ?? "—"} · Grade {cls.grade}
          {teacher ? ` · ${teacher.full_name}` : ""} · {fmtTime(cls.start_time)}
          {session?.status === "completed" && " · already completed (editing)"}
        </p>
      </header>

      {roster.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <p className="text-sm mb-4" style={{ color: "rgba(245,240,232,0.5)" }}>
            No students enrolled in this class yet.
          </p>
          <Link href={`/admin/classes/${cls.id}`} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>
            Enrol Students
          </Link>
        </div>
      ) : (
        <AttendanceScreen
          classId={cls.id}
          sessionDate={today}
          startTime={cls.start_time?.slice(0, 5) ?? null}
          roster={roster}
          existingNotes={{
            topic: session?.topic_covered ?? "",
            homework: session?.homework_assigned ?? "",
            teacherNotes: session?.teacher_notes ?? "",
          }}
          alreadyCompleted={session?.status === "completed"}
          finishAction={finishClass}
        />
      )}
    </div>
  );
}
