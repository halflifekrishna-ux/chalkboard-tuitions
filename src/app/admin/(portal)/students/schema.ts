import { z } from "zod";

const phoneRegex = /^\+?[0-9]{10,13}$/;

export const studentSchema = z.object({
  full_name: z.string().min(2, "Student name is required"),
  grade: z.coerce.number().int().min(1).max(12),
  board: z.enum(["cbse", "icse", "state_board"]),
  status: z
    .enum(["active", "inactive", "graduated", "dropped", "transferred", "archived"])
    .default("active"),
  school_name: z.string().optional(),
  emergency_contact: z.string().optional(),
  notes: z.string().optional(),
  // Parent (upserted by phone)
  parent_name: z.string().min(2, "Parent name is required"),
  parent_phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
  parent_whatsapp: z.string().regex(phoneRegex, "Enter a valid WhatsApp number").or(z.literal("")).optional(),
  parent_email: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  parent_relationship: z.string().default("parent"),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

export const communicationSchema = z.object({
  type: z.enum(["whatsapp", "sms", "phone_call", "email", "note"]),
  direction: z.enum(["incoming", "outgoing"]),
  message: z.string().min(1, "Message is required"),
});

export const documentSchema = z.object({
  kind: z.enum(["report_card", "id_proof", "admission_form", "medical_note", "other"]),
});
