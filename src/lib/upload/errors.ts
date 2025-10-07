export type UploadErrorCode =
  | "FILE_TYPE_UNSUPPORTED"
  | "FILE_SIZE_EXCEEDED"
  | "AUDIO_MIME_INVALID"
  | "SIGNED_URL_FAIL"
  | "UPLOAD_ABORTED"
  | "UPLOAD_NETWORK"
  | "UPLOAD_HTTP_STATUS"
  | "EPISODE_CREATE_FAIL"
  | "DOCUMENT_REGISTER_FAIL"
  | "PDF_PAGE_EXTRACT_FAIL"
  | "UNKNOWN";

export interface NormalizedUploadError {
  code: UploadErrorCode;
  technicalMessage?: string;
  userMessage: string;
  recoverable: boolean;
  severity: "error" | "warning";
  meta?: Record<string, any>;
}

const DEFAULT_LIMIT_MB = 50;

const messages: Record<
  UploadErrorCode,
  Omit<NormalizedUploadError, "technicalMessage" | "meta">
> = {
  FILE_TYPE_UNSUPPORTED: {
    code: "FILE_TYPE_UNSUPPORTED",
    userMessage: "Tipo de arquivo não suportado.",
    recoverable: true,
    severity: "error",
  },
  FILE_SIZE_EXCEEDED: {
    code: "FILE_SIZE_EXCEEDED",
    userMessage: `Arquivo excede o limite permitido.`,
    recoverable: true,
    severity: "error",
  },
  AUDIO_MIME_INVALID: {
    code: "AUDIO_MIME_INVALID",
    userMessage: "O arquivo selecionado não parece ser um áudio válido.",
    recoverable: true,
    severity: "error",
  },
  SIGNED_URL_FAIL: {
    code: "SIGNED_URL_FAIL",
    userMessage: "Falha ao preparar upload. Tente novamente.",
    recoverable: true,
    severity: "error",
  },
  UPLOAD_ABORTED: {
    code: "UPLOAD_ABORTED",
    userMessage: "Upload cancelado pelo usuário.",
    recoverable: true,
    severity: "warning",
  },
  UPLOAD_NETWORK: {
    code: "UPLOAD_NETWORK",
    userMessage: "Problema de rede durante o upload.",
    recoverable: true,
    severity: "error",
  },
  UPLOAD_HTTP_STATUS: {
    code: "UPLOAD_HTTP_STATUS",
    userMessage: "Resposta inesperada do servidor durante o upload.",
    recoverable: true,
    severity: "error",
  },
  EPISODE_CREATE_FAIL: {
    code: "EPISODE_CREATE_FAIL",
    userMessage: "Não foi possível criar o episódio.",
    recoverable: false,
    severity: "error",
  },
  DOCUMENT_REGISTER_FAIL: {
    code: "DOCUMENT_REGISTER_FAIL",
    userMessage: "Documento enviado, mas não pôde ser registrado.",
    recoverable: true,
    severity: "warning",
  },
  PDF_PAGE_EXTRACT_FAIL: {
    code: "PDF_PAGE_EXTRACT_FAIL",
    userMessage: "Não foi possível detectar o número de páginas do PDF.",
    recoverable: true,
    severity: "warning",
  },
  UNKNOWN: {
    code: "UNKNOWN",
    userMessage: "Ocorreu um erro inesperado.",
    recoverable: true,
    severity: "error",
  },
};

export function normalizeUploadError(params: {
  code?: UploadErrorCode;
  technicalMessage?: string;
  meta?: Record<string, any>;
}): NormalizedUploadError {
  const base = (params.code && messages[params.code]) || messages["UNKNOWN"];
  return {
    ...base,
    technicalMessage: params.technicalMessage,
    meta: params.meta,
  };
}

/**
 * Gera mensagem de usuário enriquecida com detalhes contextuais.
 */
export function buildUserMessage(err: NormalizedUploadError): string {
  const { code, userMessage, meta } = err;
  if (code === "FILE_SIZE_EXCEEDED" && meta?.limitMB && meta?.actualMB) {
    return `${userMessage} (Limite: ${meta.limitMB}MB | Arquivo: ${meta.actualMB}MB)`;
  }
  if (code === "FILE_TYPE_UNSUPPORTED" && meta?.allowed) {
    return `${userMessage} Tipos permitidos: ${meta.allowed.join(", ")}.`;
  }
  if (code === "UPLOAD_HTTP_STATUS" && meta?.status) {
    return `${userMessage} (HTTP ${meta.status})`;
  }
  return userMessage;
}

/**
 * Validação local de arquivo genérica.
 */
export function validateFileType(
  file: File,
  allowedExt: string[]
): NormalizedUploadError | null {
  const lower = file.name.toLowerCase();
  if (!allowedExt.some((ext) => lower.endsWith(ext))) {
    return normalizeUploadError({
      code: "FILE_TYPE_UNSUPPORTED",
      meta: { allowed: allowedExt },
    });
  }
  return null;
}

export function validateFileSize(
  file: File,
  limitMB: number = DEFAULT_LIMIT_MB
): NormalizedUploadError | null {
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > limitMB) {
    return normalizeUploadError({
      code: "FILE_SIZE_EXCEEDED",
      meta: { limitMB, actualMB: sizeMB.toFixed(2) },
    });
  }
  return null;
}
