// src/services/episodeService.client.ts

import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";

/**
 * Busca o número do último episódio de um programa específico.
 * Esta função é segura para ser executada no lado do cliente (navegador).
 *
 * @param programId - O UUID do programa para o qual você quer encontrar o último episódio.
 * @returns Uma Promise que resolve para o número do último episódio, ou 0 se nenhum episódio for encontrado.
 */
export const getLastEpisodeNumber = async (
  programId: string
): Promise<number> => {
  if (!programId) {
    console.warn(
      "Nenhum ID de programa fornecido para buscar o último episódio."
    );
    return 0;
  }

  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("episodes")
    .select("episode_number")
    .eq("program_id", programId)
    .order("episode_number", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.warn(
      `Não foi possível buscar o número do último episódio para o programa ${programId}. Isso pode significar que ainda não há episódios. Erro:`,
      error.message
    );
    return 0;
  }

  return data?.episode_number || 0;
};
