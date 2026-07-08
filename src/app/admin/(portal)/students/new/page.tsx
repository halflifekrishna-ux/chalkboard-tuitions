import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StudentForm } from "@/components/admin/StudentForm";
import { createStudent } from "../actions";

export const dynamic = "force-dynamic";

export default function NewStudentPage() {
  return (
    <div className="space-y-5 max-w-xl">
      <header>
        <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Students
        </Link>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>
          Add Student
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          A student ID is generated automatically. The parent is matched by phone number.
        </p>
      </header>

      <StudentForm action={createStudent} submitLabel="Add Student" />
    </div>
  );
}
