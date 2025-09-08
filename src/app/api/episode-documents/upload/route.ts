import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { supabase } from "@/src/lib/supabase";

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
    const episode_id = formData.get("episode_id") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    if (!episode_id) {
      return NextResponse.json(
        { error: "O ID do episódio é obrigatório." },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const fileExt = file.name.split(".").pop();
    const generatedFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const file_key = `documents/${generatedFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: file_key,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
    });

    await s3Client.send(command);

    const file_url = `${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${file_key}`;
    const file_name = file.name;

    const { data, error } = await supabase
      .from("episode_documents")
      .insert([{ episode_id, file_name, file_url, file_key }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
      throw new Error("Erro ao salvar o documento no banco de dados.");
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Erro ao enviar o arquivo:", error);
    const errorMessage =
      error.message || "Erro no servidor ao tentar fazer upload do arquivo.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
