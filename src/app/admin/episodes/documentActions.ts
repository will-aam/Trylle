// src/app/admin/episodes/documentActions.ts
"use server";

import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function deleteDocumentAction(
  documentId: string,
  storagePath: string
) {
  const supabase = await createSupabaseServerClient();
  const { error: storageError } = await supabase.storage
    .from("episode-documents")
    .remove([storagePath]);

  if (storageError) {
    return { success: false, error: storageError.message };
  }

  const { error: dbError } = await supabase
    .from("episode_documents")
    .delete()
    .eq("id", documentId);

  if (dbError) {
    return { success: false, error: dbError.message };
  }

  revalidatePath("/admin/episodes");
  return { success: true };
}

export async function uploadDocumentAction(
  episodeId: string,
  formData: FormData
) {
  const supabase = await createSupabaseServerClient();
  const documentFile = formData.get("file") as File;

  if (!documentFile) {
    return { success: false, error: "Nenhum arquivo encontrado." };
  }

  const filePath = `documents/${episodeId}-${Date.now()}-${documentFile.name}`;

  const { error: storageError } = await supabase.storage
    .from("episode-documents")
    .upload(filePath, documentFile);

  if (storageError) {
    return { success: false, error: storageError.message };
  }

  revalidatePath("/admin/episodes");
  return { success: true };
}

export async function updateAudioAction(episodeId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const newAudioFile = formData.get("file") as File;
  const oldAudioFileName = formData.get("oldFile") as string;

  if (!newAudioFile) {
    return { success: false, error: "Nenhum arquivo de áudio encontrado." };
  }
  // Deleta o antigo
  if (oldAudioFileName) {
    await supabase.storage.from("episode-audios").remove([oldAudioFileName]);
  }
  // Upload do novo
  const newFilePath = `${episodeId}-${Date.now()}-${newAudioFile.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("episode-audios")
    .upload(newFilePath, newAudioFile);

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from("episode-audios")
    .getPublicUrl(uploadData.path);

  // Atualiza o episódio
  const { error: updateError } = await supabase
    .from("episodes")
    .update({
      audio_url: urlData.publicUrl,
      file_name: newAudioFile.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", episodeId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath("/admin/episodes");
  return { success: true };
}
