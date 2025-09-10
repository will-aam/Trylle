import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "Nome e tipo do arquivo são obrigatórios." },
        { status: 400 }
      );
    }

    const fileExt = fileName.split(".").pop();
    const uniqueFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    // CORREÇÃO APLICADA AQUI
    const filePath = `audio/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filePath,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${filePath}`;

    return NextResponse.json({
      signedUrl,
      publicUrl,
      storagePath: filePath,
      originalFileName: fileName,
    });
  } catch (error) {
    console.error("Erro ao gerar Pre-signed URL para documento:", error);
    return NextResponse.json(
      { error: "Erro no servidor ao preparar o upload do documento." },
      { status: 500 }
    );
  }
}
