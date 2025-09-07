import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

async function getS3Client() {
  try {
    const accountId = process.env.R2_ACCOUNT_ID;
    if (!accountId) {
      throw new Error(
        "A variável de ambiente R2_ACCOUNT_ID não está definida."
      );
    }

    const s3Client = new S3Client({
      region: "auto",
      // CORREÇÃO APLICADA AQUI
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    return s3Client;
  } catch (error) {
    console.error("Falha ao inicializar o S3 Client:", error);
    throw new Error("Erro na configuração do serviço de armazenamento.");
  }
}

export async function POST(request: Request) {
  let s3Client;
  try {
    s3Client = await getS3Client();
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `audios/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filePath,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
    });

    await s3Client.send(command);

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${filePath}`;

    return NextResponse.json({ publicUrl, filePath });
  } catch (error: any) {
    console.error("Erro ao enviar o arquivo para o R2:", error);
    const errorMessage =
      error.message || "Erro no servidor ao tentar fazer upload do arquivo.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
