import { createServerSupabase } from "./supabase-server";

export const PHOTO_BUCKET = "student-photos";
export const DOCS_BUCKET = "student-documents";

/** Short-lived signed URL for a private storage object; null if missing. */
export async function signedUrl(bucket: string, path: string | null, expiresIn = 3600) {
  if (!path) return null;
  const supabase = createServerSupabase();
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}

/** Upload a File from a Server Action; returns the storage path. */
export async function uploadFile(bucket: string, prefix: string, file: File): Promise<string> {
  const supabase = createServerSupabase();
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${prefix}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
}
