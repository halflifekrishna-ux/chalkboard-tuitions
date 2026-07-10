"use server";

import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/os/auth";
import { requeueFailed, processQueue } from "@/lib/os/whatsapp";

export async function retryQueue(): Promise<void> {
  await requireCapability("communications.manage");
  await requeueFailed();
  await processQueue();
  revalidatePath("/admin/whatsapp");
  revalidatePath("/admin");
}
