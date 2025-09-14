// src/app/api/monitoring/cloudflare/route.ts
import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

// Limite do plano gratuito do Cloudflare R2 (10GB)
const R2_FREE_TIER_LIMIT_GB = 10;

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function GET() {
  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET_NAME
  ) {
    return NextResponse.json(
      { error: "Credenciais do Cloudflare R2 não configuradas." },
      { status: 500 }
    );
  }

  try {
    let totalSizeBytes = 0;
    let isTruncated = true;
    let continuationToken: string | undefined;

    // A API S3 lista objetos em páginas de 1000. Precisamos iterar por todas as páginas.
    while (isTruncated) {
      const command = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(command);

      if (response.Contents) {
        totalSizeBytes += response.Contents.reduce(
          (acc, obj) => acc + (obj.Size || 0),
          0
        );
      }

      isTruncated = response.IsTruncated || false;
      continuationToken = response.NextContinuationToken;
    }

    const usageGB = totalSizeBytes / (1024 * 1024 * 1024);
    const usagePercentage = (usageGB / R2_FREE_TIER_LIMIT_GB) * 100;

    // Formata o uso para MB ou GB, o que for mais apropriado
    const formattedUsage =
      usageGB < 1
        ? `${(usageGB * 1024).toFixed(2)} MB`
        : `${usageGB.toFixed(2)} GB`;

    return NextResponse.json({
      usage: formattedUsage,
      limit: `${R2_FREE_TIER_LIMIT_GB} GB`,
      usagePercentage: Math.round(usagePercentage),
    });
  } catch (error: any) {
    console.error("Erro ao buscar dados do Cloudflare R2:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do Cloudflare R2." },
      { status: 500 }
    );
  }
}
