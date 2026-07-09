"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/os/auth";
import { requeueFailed, processQueue } from "@/lib/os/whatsapp";

export async function retryQueue(): Promise<void> {
  await requireAdmin();
  await requeueFailed();
  await processQueue();
  revalidatePath("/admin/whatsapp");
  revalidatePath("/admin");
}
