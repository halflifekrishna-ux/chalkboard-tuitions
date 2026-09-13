import { z } from "zod";

export const DAY_OPTIONS = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
] as const;

export const WEEKDAY_VALUES = ["mon", "tue", "wed", "thu", "fri"] as const;

export const SUBJECT_COLOURS = [
  "#c9a227", "#4a9eca", "#7dc98f", "#e8784d", "#e8a0b4", "#9d7cd8", "#4ec9b0",
] as const;

export const batchSchema = z.object({
  name: z.string().min(2, "Batch name is required"),
  academic_year_id: z.string().uuid("Pick an academic year"),
  grade: z.coerce.number().int().min(1).max(12),
  board: z.enum(["cbse", "icse", "state_board"]).optional(),
  capacity: z.coerce.number().int().min(1).max(200).default(8),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
  notes: z.string().optional(),
  // The batch's own dedicated slot — one schedule for every subject taught in it.
  days: z.array(z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])).min(1, "Pick at least one day"),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a start time"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Pick an end time"),
  room: z.string().optional(),
});

export type BatchFormValues = z.infer<typeof batchSchema>;

// A subject taught within a batch — just what's covered and by whom. No
// schedule of its own: any subject can run at any time within the batch's slot.
export const batchSubjectSchema = z.object({
  subject_id: z.string().uuid("Pick a subject"),
  teacher_name: z.string().optional(),
  colour: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#c9a227"),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
});

export type BatchSubjectFormValues = z.infer<typeof batchSubjectSchema>;
