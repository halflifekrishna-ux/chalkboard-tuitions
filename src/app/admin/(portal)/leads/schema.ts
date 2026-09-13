import { z } from "zod";

const phoneRegex = /^\+?[0-9]{10,13}$/;

export const leadSchema = z.object({
  vertical: z.enum(["tuitions", "studio"]),
  full_name: z.string().min(2, "Name is required"),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  source: z.enum(["marketing", "website", "referral", "walk_in", "other"]).default("marketing"),
  notes: z.string().optional(),
  // Tuitions
  student_grade: z.coerce.number().int().min(1).max(12).optional().or(z.literal("").transform(() => undefined)),
  board: z.enum(["cbse", "icse", "state_board"]).optional().or(z.literal("").transform(() => undefined)),
  // Studio
  organisation: z.string().optional(),
  audience: z.enum(["corporate", "college", "individual"]).optional().or(z.literal("").transform(() => undefined)),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

export const statusUpdateSchema = z.object({
  status: z.enum(["contacted", "follow_up", "converted", "lost"]),
  note: z.string().optional(),
  next_action: z.string().optional(),
  next_action_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).optional(),
  lost_reason: z.string().optional(),
});
