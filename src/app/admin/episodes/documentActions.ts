"use server";

import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { revalidateEpisodes } from "./revalidation";

/* ================== CONFIG ================== */
const DOCUMENT_BUCKET = "episode-documents";
const AUDIO_BUCKET = "episode-audios";
const ALLOWED_DOC_EXT = [".pdf", ".doc", ".docx"];
const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024;

/* ================== TIPOS ================== */
interface BaseResult {
  success: boolean;
  error?: string;
  code?: string; // usado apenas quando tivermos alguma string explícita (ex: dbError.code)
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

/* =========================================================
   1) Funções de documento (LEGADO) - upload simples (sem progresso)
   Mantidas para compatibilidade caso ainda haja chamadas antigas.
========================================================= */

export interface UploadDocumentResult extends BaseResult {
  success: boolean;
  document?: EpisodeDocumentRecord;
}

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
          1024 /
          1024
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

    revalidateEpisodes();

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
    };
  }
}

/* =========================================================
   2) Delete de documento
========================================================= */
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
    };
  }

  const { error: dbError } = await supabase
    .from("episode_documents")
    .delete()
    .eq("id", documentId);

  if (dbError) {
    return { success: false, error: dbError.message, code: dbError.code };
  }

  revalidateEpisodes();
  return { success: true };
}

/* =========================================================
   3) Update metadados de documento (page_count, reference_count)
========================================================= */
export interface UpdateDocumentMetadataResult extends BaseResult {
  success: boolean;
  document?: EpisodeDocumentRecord;
}

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
        code: (error as any)?.code,
      };
    }

    revalidateEpisodes();
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
    };
  }
}

/* =========================================================
   4) Update audio
========================================================= */
export interface UpdateAudioResult extends BaseResult {
  success: boolean;
  audio_url?: string;
  file_name?: string;
}

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

    // Remove antigo (se passado)
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

    revalidateEpisodes();
    return { success: true, audio_url: publicUrl, file_name: safeAudioName };
  } catch (e: any) {
    return { success: false, error: e?.message || "Erro inesperado." };
  }
}

/* =========================================================
   5) NOVO: Signed URL para upload com progresso real
========================================================= */
export interface GetSignedUrlResult extends BaseResult {
  success: boolean;
  signedUrl?: string;
  storagePath?: string;
  sanitizedFileName?: string;
}

export async function getDocumentSignedUploadUrl(
  episodeId: string,
  originalFileName: string
): Promise<GetSignedUrlResult> {
  const supabase = await createSupabaseServerClient();

  if (!originalFileName) {
    return { success: false, error: "Nome de arquivo ausente." };
  }

  const lower = originalFileName.toLowerCase();
  if (!ALLOWED_DOC_EXT.some((ext) => lower.endsWith(ext))) {
    return {
      success: false,
      error: `Extensão não suportada. Use: ${ALLOWED_DOC_EXT.join(", ")}`,
      code: "INVALID_EXTENSION",
    };
  }

  const safeName = originalFileName.replace(/[^\w.\-]+/g, "_");
  const storagePath = `documents/${episodeId}-${Date.now()}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Falha ao gerar URL assinada.",
    };
  }

  return {
    success: true,
    signedUrl: data.signedUrl,
    storagePath,
    sanitizedFileName: safeName,
  };
}

/* =========================================================
   6) NOVO: Registrar documento após upload real
========================================================= */
export interface RegisterDocumentResult extends BaseResult {
  success: boolean;
  document?: EpisodeDocumentRecord;
}

export async function registerUploadedDocumentAction(params: {
  episodeId: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  pageCount?: number | null;
  referenceCount?: number | null;
}): Promise<RegisterDocumentResult> {
  const {
    episodeId,
    storagePath,
    fileName,
    fileSize,
    pageCount = null,
    referenceCount = null,
  } = params;

  const supabase = await createSupabaseServerClient();

  // Public URL
  const { data: publicData } = supabase.storage
    .from(DOCUMENT_BUCKET)
    .getPublicUrl(storagePath);
  const publicUrl = publicData.publicUrl;

  const { data: inserted, error: dbError } = await supabase
    .from("episode_documents")
    .insert({
      episode_id: episodeId,
      file_name: fileName,
      public_url: publicUrl,
      storage_path: storagePath,
      file_size: fileSize,
      page_count: pageCount ?? null,
      reference_count: referenceCount ?? null,
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
    return {
      success: false,
      error: dbError?.message || "Falha ao registrar documento.",
      code: dbError?.code,
    };
  }

  revalidateEpisodes();

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
}
