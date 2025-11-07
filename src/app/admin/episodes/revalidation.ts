"use server";

import { revalidatePath } from "next/cache";

export function revalidateEpisodes() {
  if (process.env.NODE_ENV === "production") {
    revalidatePath("/admin/episodes");
  }
}
