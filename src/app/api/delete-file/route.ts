import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Reutilizamos a configuração do cliente S3 que fizemos para o upload
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://cfd93b192a5f95b371cd3c99010c6ce4.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { fileKey } = await request.json();

    if (!fileKey) {
      return NextResponse.json(
        { error: "Nenhuma chave de arquivo fornecida." },
        { status: 400 }
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileKey, // A chave é o caminho do arquivo no bucket (ex: 'audios/nome-do-arquivo.mp3')
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir arquivo do R2:", error);
    return NextResponse.json(
      { error: "Erro ao excluir o arquivo." },
      { status: 500 }
    );
  }
}
