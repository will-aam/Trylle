// src/app/admin/episodes/revalidation.ts
"use server";

import { revalidatePath } from "next/cache";

export async function revalidateEpisodes() {
  if (process.env.NODE_ENV === "production") {
    revalidatePath("/admin/episodes");
  }
}
