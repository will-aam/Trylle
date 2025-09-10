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
    const audioFile = formData.get("file") as File | null;
    const thumbnailFile = formData.get("thumbnail") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required." },
        { status: 400 }
      );
    }

    const uploadFile = async (file: File, folder: string) => {
      const fileBuffer = await file.arrayBuffer();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const storage_path = `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: storage_path,
        Body: Buffer.from(fileBuffer),
        ContentType: file.type,
      });

      await s3Client.send(command);
      return `${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${storage_path}`;
    };

    const uploadPromises = [];
    uploadPromises.push(uploadFile(audioFile, "audio"));
    if (thumbnailFile) {
      uploadPromises.push(uploadFile(thumbnailFile, "thumbnails"));
    }

    const [audio_url, thumbnail_url] = await Promise.all(uploadPromises);

    return NextResponse.json({ audio_url, thumbnail_url });
  } catch (error: any) {
    console.error("Error uploading files to R2:", error);
    const errorMessage =
      error.message || "Server error while attempting to upload files.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
