"use server";

import { createSupabaseServerClient } from "@/src/lib/supabase-server";

const AUDIO_BUCKET = "episode-audios";

/**
 * Discriminated union:
 * - success: true  -> todos os campos obrigatórios (sem undefined)
 * - success: false -> só error
 */
export type GetAudioCreationSignedUrlResult =
  | {
      success: true;
      signedUrl: string;
      storagePath: string;
      sanitizedFileName: string;
      publicUrl: string;
    }
  | {
      success: false;
      error: string;
      code?: string;
    };

/**
 * Gera signed URL para upload de áudio ANTES de existir episódio.
 * O arquivo ficará com prefixo precreate/ + timestamp.
 */
export async function getAudioSignedUploadUrlForCreation(
  originalFileName: string
): Promise<GetAudioCreationSignedUrlResult> {
  if (!originalFileName) {
    return { success: false, error: "Nome do arquivo ausente." };
  }

  const supabase = await createSupabaseServerClient();
  const safeName = originalFileName.replace(/[^\w.\-]+/g, "_");
  const storagePath = `precreate/${Date.now()}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Falha ao gerar URL assinada.",
    };
  }

  const { data: pub } = supabase.storage
    .from(AUDIO_BUCKET)
    .getPublicUrl(storagePath);

  return {
    success: true,
    signedUrl: data.signedUrl,
    storagePath,
    sanitizedFileName: safeName,
    publicUrl: pub.publicUrl,
  };
}
