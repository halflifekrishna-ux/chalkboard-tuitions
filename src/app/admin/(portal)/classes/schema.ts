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

export const classSchema = z.object({
  name: z.string().min(2, "Class name is required"),
  subject_id: z.string().uuid("Pick a subject"),
  grade: z.coerce.number().int().min(1).max(12),
  board: z.enum(["cbse", "icse", "state_board"]).optional(),
  teacher_name: z.string().optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a start time"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Pick an end time"),
  days: z.array(z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])).min(1, "Pick at least one day"),
  capacity: z.coerce.number().int().min(1).max(200).default(8),
  room: z.string().optional(),
  is_active: z.coerce.boolean().default(true),
});

export type ClassFormValues = z.infer<typeof classSchema>;
