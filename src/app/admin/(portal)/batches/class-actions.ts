"use server";

import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { saveClassRecord, type ClassResult } from "@/lib/os/class-save";

export type { ClassResult };

export async function saveClass(classId: string | null, input: unknown): Promise<ClassResult> {
  const admin = await requireCapability("batches.manage");
  return saveClassRecord(createServerSupabase(), admin, classId, input);
}
