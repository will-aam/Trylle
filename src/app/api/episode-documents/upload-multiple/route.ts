import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

async function getS3Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  if (!accountId) {
    throw new Error("Missing R2_ACCOUNT_ID environment variable.");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function POST(request: Request) {
  // 3. Criar a instância do Supabase no início da função
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  let s3Client;
  try {
    s3Client = await getS3Client();
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const episode_id = formData.get("episode_id") as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files were uploaded." },
        { status: 400 }
      );
    }

    if (!episode_id) {
      return NextResponse.json(
        { error: "Episode ID is required." },
        { status: 400 }
      );
    }

    const documentsToInsert = [];

    for (const file of files) {
      const fileBuffer = await file.arrayBuffer();
      const fileExt = file.name.split(".").pop();
      const generatedFileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const storage_path = `documents/${generatedFileName}`;

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: storage_path,
        Body: Buffer.from(fileBuffer),
        ContentType: file.type,
      });

      await s3Client.send(command);

      const public_url = `${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${storage_path}`;

      documentsToInsert.push({
        episode_id,
        file_name: file.name,
        public_url,
        storage_path,
      });
    }

    const { data, error } = await supabase
      .from("episode_documents")
      .insert(documentsToInsert)
      .select();

    if (error) {
      console.error("Error saving documents to Supabase:", error);
      return NextResponse.json(
        {
          message: "Documents uploaded, but failed to associate with episode.",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: error.message || "Server error during file upload." },
      { status: 500 }
    );
  }
}
