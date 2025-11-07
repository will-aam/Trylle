"use server";

import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { revalidateEpisodes } from "./revalidation";

const AUDIO_BUCKET = "episode-audios";

interface BaseResult {
  success: boolean;
  error?: string;
  code?: string;
}

export interface GetAudioSignedUrlResult extends BaseResult {
  success: boolean;
  signedUrl?: string;
  storagePath?: string;
  sanitizedFileName?: string;
}

export async function getAudioSignedUploadUrl(
  episodeId: string,
  originalFileName: string
): Promise<GetAudioSignedUrlResult> {
  const supabase = await createSupabaseServerClient();
  if (!originalFileName) {
    return { success: false, error: "Nome do arquivo ausente." };
  }
  const safeName = originalFileName.replace(/[^\w.\-]+/g, "_");
  const storagePath = `${episodeId}-${Date.now()}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Falha ao gerar URL assinada de áudio.",
    };
  }

  return {
    success: true,
    signedUrl: data.signedUrl,
    storagePath,
    sanitizedFileName: safeName,
  };
}

export interface RegisterUpdatedAudioResult extends BaseResult {
  success: boolean;
  audio_url?: string;
  file_name?: string;
}

export async function registerUpdatedAudioAction(params: {
  episodeId: string;
  storagePath: string;
  newFileName: string;
  oldFileName?: string | null;
}): Promise<RegisterUpdatedAudioResult> {
  const { episodeId, storagePath, newFileName, oldFileName } = params;
  const supabase = await createSupabaseServerClient();

  // Gera public URL
  const { data: publicData } = supabase.storage
    .from(AUDIO_BUCKET)
    .getPublicUrl(storagePath);
  const publicUrl = publicData.publicUrl;

  // Remove antigo se existir
  if (oldFileName) {
    await supabase.storage.from(AUDIO_BUCKET).remove([oldFileName]);
  }

  const { error: updateError } = await supabase
    .from("episodes")
    .update({
      audio_url: publicUrl,
      file_name: newFileName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", episodeId);

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
      code: updateError.code,
    };
  }

  revalidateEpisodes();

  return { success: true, audio_url: publicUrl, file_name: newFileName };
}
