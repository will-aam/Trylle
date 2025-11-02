// src/app/api/generate-presigned-url-program-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import crypto from "crypto";
// Importe as funções do seu arquivo de erros existente
import {
  normalizeUploadError,
  buildUserMessage,
} from "@/src/lib/upload/errors";

// =================================================================
// CONFIGURAÇÃO DO CLIENTE S3 (CLOUDFLARE R2)
// =================================================================
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, // CORRIGIDO
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!, // CORRIGIDO
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!, // CORRIGIDO
  },
});

// =================================================================
// CONSTANTES DE VALIDAÇÃO DA IMAGEM
// =================================================================
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB - CORRIGIDO (estava 500MB)
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Gera um nome de arquivo único e seguro
const generateUniqueFileName = (fileType: string): string => {
  const hash = crypto.randomBytes(16).toString("hex");
  const extension = fileType.split("/")[1] || "jpg";
  return `program-image_${hash}.${extension}`;
};

// =================================================================
// HANDLER DA ROTA (POST)
// =================================================================
export async function POST(req: NextRequest) {
  try {
    // 1. Autenticação e Autorização (Admin)
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn(
        "generate-presigned-url-program-image: Não autorizado (sem usuário)"
      );
      return NextResponse.json(
        { error: "Você precisa estar logado." },
        { status: 401 }
      );
    }

    // TODO: Adicionar verificação de role de ADMIN quando implementado
    // Por enquanto, apenas checa se está logado.

    // 2. Obter e Validar Dados do Request
    const { fileType, fileSize } = await req.json();

    if (!fileType || !fileSize) {
      // Use seu sistema de erros normalizado
      const error = normalizeUploadError({ code: "UNKNOWN" });
      throw new Error(buildUserMessage(error));
    }

    // 3. Validação de Segurança
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      const error = normalizeUploadError({
        code: "FILE_TYPE_UNSUPPORTED",
        meta: {
          allowed: ALLOWED_FILE_TYPES.map((t) => t.split("/")[1].toUpperCase()),
        },
      });
      throw new Error(buildUserMessage(error));
    }
    if (fileSize > MAX_FILE_SIZE) {
      const error = normalizeUploadError({
        code: "FILE_SIZE_EXCEEDED",
        meta: { limitMB: 5, actualMB: (fileSize / (1024 * 1024)).toFixed(2) },
      });
      throw new Error(buildUserMessage(error));
    }

    // 4. Gerar Nome e Caminho do Arquivo
    const uniqueFileName = generateUniqueFileName(fileType);
    const storageKey = `programs/images/${uniqueFileName}`;

    // 5. Criar Comando e Gerar Presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!, // CORRIGIDO
      Key: storageKey,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 }); // 1 hora para expirar

    // 6. Gerar a URL pública (para salvar no DB)
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${storageKey}`; // CORRIGIDO

    // 7. Retornar URLs
    return NextResponse.json({
      presignedUrl,
      publicUrl,
      storageKey,
    });
  } catch (error) {
    console.error(
      "Erro ao gerar presigned URL para imagem do programa:",
      error
    );

    // O tratamento de erro agora é mais simples, pois já lançamos erros com mensagens amigáveis
    const errorMessage =
      error instanceof Error ? error.message : "Ocorreu um erro interno.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
