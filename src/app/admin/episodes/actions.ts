// src/app/admin/episodes/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import {
  deleteEpisode as deleteEpisodeService,
  updateEpisode as updateEpisodeService,
} from "@/src/services/episodeService";
import { Episode } from "@/src/lib/types";

export async function updateEpisodeAction(
  episodeId: string,
  updates: Partial<Episode>
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateEpisodeService(episodeId, updates);
    revalidatePath("/admin/episodes"); // Avisa o Next.js para recarregar os dados da página
    return { success: true };
  } catch (error) {
    console.error("Error updating episode:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteEpisodeAction(
  episodeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteEpisodeService(episodeId);
    revalidatePath("/admin/episodes"); // Avisa o Next.js para recarregar os dados da página
    return { success: true };
  } catch (error) {
    console.error("Error deleting episode:", error);
    return { success: false, error: (error as Error).message };
  }
}
