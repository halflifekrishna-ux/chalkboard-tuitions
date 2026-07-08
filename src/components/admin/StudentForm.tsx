"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { studentSchema, type StudentFormValues } from "@/app/admin/(portal)/students/schema";
import type { ActionState } from "@/app/admin/(portal)/students/actions";

const inputCls =
  "w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]";
const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };
const labelStyle = { color: "rgba(245,240,232,0.6)" };

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1" style={{ color: "#e8a090" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs uppercase tracking-widest font-semibold pt-2" style={{ color: "#c9a227" }}>
      {children}
    </h2>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl py-3.5 px-8 font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60"
      style={{ background: "#c9a227", color: "#162d24" }}
    >
      <Save size={16} />
      {pending ? "Saving…" : label}
    </button>
  );
}

export function StudentForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: Partial<StudentFormValues>;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState<ActionState, FormData>(action, {});
  const {
    register,
    formState: { errors },
  } = useForm<StudentFormValues>({
    // zod v4 coerce/default input types differ from output; validation behaviour is identical
    resolver: zodResolver(studentSchema) as unknown as Resolver<StudentFormValues>,
    mode: "onBlur",
    defaultValues: {
      status: "active",
      board: "cbse",
      parent_relationship: "parent",
      ...defaultValues,
    },
  });

  return (
    <form action={formAction} className="space-y-4">
      <SectionTitle>Student</SectionTitle>

      <Field label="Full name" error={errors.full_name?.message}>
        <input {...register("full_name")} className={inputCls} style={inputStyle} placeholder="e.g. Aarav Sharma" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Grade" error={errors.grade?.message}>
          <select {...register("grade")} className={inputCls} style={inputStyle}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g} style={{ color: "#162d24" }}>
                Grade {g}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Board" error={errors.board?.message}>
          <select {...register("board")} className={inputCls} style={inputStyle}>
            <option value="cbse" style={{ color: "#162d24" }}>CBSE</option>
            <option value="icse" style={{ color: "#162d24" }}>ICSE</option>
            <option value="state_board" style={{ color: "#162d24" }}>State Board</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Status" error={errors.status?.message}>
          <select {...register("status")} className={inputCls} style={inputStyle}>
            <option value="active" style={{ color: "#162d24" }}>Active</option>
            <option value="inactive" style={{ color: "#162d24" }}>Inactive</option>
            <option value="graduated" style={{ color: "#162d24" }}>Graduated</option>
            <option value="dropped" style={{ color: "#162d24" }}>Dropped</option>
            <option value="transferred" style={{ color: "#162d24" }}>Transferred</option>
            <option value="archived" style={{ color: "#162d24" }}>Archived</option>
          </select>
        </Field>
        <Field label="School (optional)" error={errors.school_name?.message}>
          <input {...register("school_name")} className={inputCls} style={inputStyle} />
        </Field>
      </div>

      <Field label="Profile photo (optional, under 5 MB)">
        <input
          type="file"
          name="photo"
          accept="image/*"
          className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:px-4 file:py-2 file:text-xs file:font-bold"
          style={{ color: "rgba(245,240,232,0.6)" }}
        />
      </Field>

      <SectionTitle>Parent / Guardian</SectionTitle>

      <Field label="Parent name" error={errors.parent_name?.message}>
        <input {...register("parent_name")} className={inputCls} style={inputStyle} placeholder="e.g. Priya Sharma" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone" error={errors.parent_phone?.message}>
          <input
            {...register("parent_phone")}
            className={inputCls}
            style={inputStyle}
            inputMode="tel"
            placeholder="+91…"
          />
        </Field>
        <Field label="WhatsApp (if different)" error={errors.parent_whatsapp?.message}>
          <input {...register("parent_whatsapp")} className={inputCls} style={inputStyle} inputMode="tel" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Email (optional)" error={errors.parent_email?.message}>
          <input {...register("parent_email")} className={inputCls} style={inputStyle} inputMode="email" />
        </Field>
        <Field label="Relationship" error={errors.parent_relationship?.message}>
          <select {...register("parent_relationship")} className={inputCls} style={inputStyle}>
            <option value="parent" style={{ color: "#162d24" }}>Parent</option>
            <option value="father" style={{ color: "#162d24" }}>Father</option>
            <option value="mother" style={{ color: "#162d24" }}>Mother</option>
            <option value="guardian" style={{ color: "#162d24" }}>Guardian</option>
          </select>
        </Field>
      </div>

      <SectionTitle>Other</SectionTitle>

      <Field label="Emergency contact (optional)" error={errors.emergency_contact?.message}>
        <input {...register("emergency_contact")} className={inputCls} style={inputStyle} inputMode="tel" />
      </Field>

      <Field label="Notes (optional)" error={errors.notes?.message}>
        <textarea {...register("notes")} rows={3} className={inputCls} style={inputStyle} />
      </Field>

      {state.error && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(220,80,60,0.15)", color: "#e8a090" }}>
          {state.error}
        </p>
      )}

      <div className="pt-2">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
