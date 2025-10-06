"use server";

import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { revalidatePath } from "next/cache";

/**
 * Tipos base
 */
interface BaseResult {
  success: boolean;
  error?: string;
  code?: string;
}

export interface EpisodeDocumentRecord {
  id: string;
  episode_id: string;
  file_name: string;
  public_url: string;
  storage_path: string;
  file_size: number | null;
  page_count: number | null;
  reference_count: number | null;
  created_at: string;
}

/**
 * Upload
 */
export interface UploadDocumentSuccess extends BaseResult {
  success: true;
  document: EpisodeDocumentRecord;
}
export interface UploadDocumentFailure extends BaseResult {
  success: false;
}
export type UploadDocumentResult =
  | UploadDocumentSuccess
  | UploadDocumentFailure;

/**
 * Update metadata
 */
export interface UpdateMetadataSuccess extends BaseResult {
  success: true;
  document: EpisodeDocumentRecord;
}
export interface UpdateMetadataFailure extends BaseResult {
  success: false;
}
export type UpdateDocumentMetadataResult =
  | UpdateMetadataSuccess
  | UpdateMetadataFailure;

/**
 * Update Audio
 */
export interface UpdateAudioSuccess extends BaseResult {
  success: true;
  audio_url: string;
  file_name: string;
}
export interface UpdateAudioFailure extends BaseResult {
  success: false;
}
export type UpdateAudioResult = UpdateAudioSuccess | UpdateAudioFailure;

const DOCUMENT_BUCKET = "episode-documents";
const AUDIO_BUCKET = "episode-audios";
const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024; // 25MB (ajuste se quiser)
const ALLOWED_DOC_EXT = [".pdf", ".doc", ".docx"];

/* ---------------- DELETE DOCUMENT ---------------- */
export async function deleteDocumentAction(
  documentId: string,
  storagePath: string
): Promise<BaseResult> {
  const supabase = await createSupabaseServerClient();

  const { error: storageError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .remove([storagePath]);
  if (storageError) {
    return {
      success: false,
      error: storageError.message,
      code: storageError.name,
    };
  }

  const { error: dbError } = await supabase
    .from("episode_documents")
    .delete()
    .eq("id", documentId);

  if (dbError) {
    return { success: false, error: dbError.message, code: dbError.code };
  }

  revalidatePath("/admin/episodes");
  return { success: true };
}

/* ---------------- UPLOAD DOCUMENT + METADADOS ----------------
   Espera FormData com:
   - file: File
   - page_count (opcional)
   - reference_count (opcional)
*/
export async function uploadDocumentAction(
  episodeId: string,
  formData: FormData
): Promise<UploadDocumentResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const documentFile = formData.get("file") as File | null;

    if (!documentFile) {
      return { success: false, error: "Nenhum arquivo encontrado." };
    }

    // Captura dos metadados opcionais
    const pageCountRaw = formData.get("page_count");
    const referenceCountRaw = formData.get("reference_count");

    const page_count =
      pageCountRaw != null && pageCountRaw !== "" ? Number(pageCountRaw) : null;
    const reference_count =
      referenceCountRaw != null && referenceCountRaw !== ""
        ? Number(referenceCountRaw)
        : null;

    if (
      (page_count != null && (isNaN(page_count) || page_count < 0)) ||
      (reference_count != null &&
        (isNaN(reference_count) || reference_count < 0))
    ) {
      return {
        success: false,
        error: "Valores inválidos em page_count/reference_count.",
        code: "INVALID_METADATA",
      };
    }

    if (documentFile.size > MAX_DOCUMENT_SIZE_BYTES) {
      return {
        success: false,
        error: `Arquivo excede ${(
          MAX_DOCUMENT_SIZE_BYTES /
          (1024 * 1024)
        ).toFixed(0)}MB.`,
        code: "FILE_TOO_LARGE",
      };
    }

    const lowerName = documentFile.name.toLowerCase();
    if (!ALLOWED_DOC_EXT.some((ext) => lowerName.endsWith(ext))) {
      return {
        success: false,
        error: `Extensão não suportada. Use: ${ALLOWED_DOC_EXT.join(", ")}`,
        code: "INVALID_EXTENSION",
      };
    }

    const safeOriginalName = documentFile.name.replace(/[^\w.\-]+/g, "_");
    const filePath = `documents/${episodeId}-${Date.now()}-${safeOriginalName}`;

    const { error: storageError } = await supabase.storage
      .from(DOCUMENT_BUCKET)
      .upload(filePath, documentFile);

    if (storageError) {
      return {
        success: false,
        error: storageError.message,
        code: storageError.name,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(DOCUMENT_BUCKET)
      .getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

    const { data: inserted, error: dbError } = await supabase
      .from("episode_documents")
      .insert({
        episode_id: episodeId,
        file_name: safeOriginalName,
        public_url: publicUrl,
        storage_path: filePath,
        file_size: documentFile.size,
        page_count,
        reference_count,
      })
      .select(
        `
        id,
        episode_id,
        file_name,
        public_url,
        storage_path,
        file_size,
        page_count,
        reference_count,
        created_at
      `
      )
      .single();

    if (dbError || !inserted) {
      await supabase.storage.from(DOCUMENT_BUCKET).remove([filePath]);
      return {
        success: false,
        error:
          dbError?.message ||
          "Falha ao salvar registro de documento após upload.",
        code: dbError?.code,
      };
    }

    revalidatePath("/admin/episodes");

    return {
      success: true,
      document: {
        id: inserted.id,
        episode_id: inserted.episode_id,
        file_name: inserted.file_name,
        public_url: inserted.public_url,
        storage_path: inserted.storage_path,
        file_size: inserted.file_size,
        page_count: inserted.page_count,
        reference_count: inserted.reference_count,
        created_at: inserted.created_at,
      },
    };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Erro inesperado no upload.",
      code: "UNEXPECTED",
    };
  }
}

/* ---------------- UPDATE METADATA (page_count, reference_count) ---------------- */
export async function updateDocumentMetadataAction(
  documentId: string,
  {
    page_count,
    reference_count,
  }: { page_count: number | null; reference_count: number | null }
): Promise<UpdateDocumentMetadataResult> {
  try {
    const supabase = await createSupabaseServerClient();

    if (
      (page_count != null && (isNaN(page_count) || page_count < 0)) ||
      (reference_count != null &&
        (isNaN(reference_count) || reference_count < 0))
    ) {
      return {
        success: false,
        error: "Valores inválidos em page_count/reference_count.",
        code: "INVALID_METADATA",
      };
    }

    const { data, error } = await supabase
      .from("episode_documents")
      .update({
        page_count,
        reference_count,
      })
      .eq("id", documentId)
      .select(
        `
        id,
        episode_id,
        file_name,
        public_url,
        storage_path,
        file_size,
        page_count,
        reference_count,
        created_at
      `
      )
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message || "Falha ao atualizar metadados do documento.",
        code: error?.code,
      };
    }

    revalidatePath("/admin/episodes");
    return {
      success: true,
      document: {
        id: data.id,
        episode_id: data.episode_id,
        file_name: data.file_name,
        public_url: data.public_url,
        storage_path: data.storage_path,
        file_size: data.file_size,
        page_count: data.page_count,
        reference_count: data.reference_count,
        created_at: data.created_at,
      },
    };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Erro inesperado ao atualizar metadados.",
      code: "UNEXPECTED",
    };
  }
}

/* ---------------- UPDATE AUDIO ---------------- */
export async function updateAudioAction(
  episodeId: string,
  formData: FormData
): Promise<UpdateAudioResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const newAudioFile = formData.get("file") as File | null;
    const oldAudioFileName = formData.get("oldFile") as string | null;

    if (!newAudioFile) {
      return { success: false, error: "Nenhum arquivo de áudio encontrado." };
    }

    if (!newAudioFile.type.startsWith("audio/")) {
      return { success: false, error: "Formato de áudio inválido." };
    }

    if (oldAudioFileName) {
      await supabase.storage.from(AUDIO_BUCKET).remove([oldAudioFileName]);
    }

    const safeAudioName = newAudioFile.name.replace(/[^\w.\-]+/g, "_");
    const newFilePath = `${episodeId}-${Date.now()}-${safeAudioName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(newFilePath, newAudioFile);
    if (uploadError || !uploadData) {
      return {
        success: false,
        error: uploadError?.message || "Falha no upload do áudio.",
      };
    }

    const { data: urlData } = supabase.storage
      .from(AUDIO_BUCKET)
      .getPublicUrl(uploadData.path);
    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from("episodes")
      .update({
        audio_url: publicUrl,
        file_name: safeAudioName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", episodeId);

    if (updateError) {
      await supabase.storage.from(AUDIO_BUCKET).remove([uploadData.path]);
      return { success: false, error: updateError.message };
    }

    revalidatePath("/admin/episodes");
    return { success: true, audio_url: publicUrl, file_name: safeAudioName };
  } catch (e: any) {
    return { success: false, error: e?.message || "Erro inesperado." };
  }
}
