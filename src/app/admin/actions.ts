"use server";

import { revalidatePath } from "next/cache";

export async function revalidateAdminDashboard() {
  revalidatePath("/admin");
}
