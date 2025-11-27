import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_UPLOAD_IMAGE_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_UPLOAD_IMAGE_BUCKET_NAME;

console.log("[R2 Config] Loaded configuration:", {
  hasAccountId: !!R2_ACCOUNT_ID,
  hasAccessKey: !!R2_ACCESS_KEY_ID,
  hasSecretKey: !!R2_SECRET_ACCESS_KEY,
  bucketName: R2_BUCKET_NAME,
  accountId: R2_ACCOUNT_ID ? `${R2_ACCOUNT_ID.substring(0, 8)}...` : "missing",
});

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.warn("[R2 Config] Missing R2 environment variables");
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadFileToR2(
  file: File,
  folder: string = "uploads"
): Promise<string> {
  console.log("[R2 Upload] Starting upload:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    folder,
    bucket: R2_BUCKET_NAME,
  });

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Preserve original filename while adding timestamp prefix to avoid collisions
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const filename = `${folder}/${Date.now()}-${sanitizedName}`;

    console.log("[R2 Upload] Preparing upload command:", {
      key: filename,
      originalName: file.name,
      contentType: file.type,
      bufferSize: buffer.length,
    });

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
      // Store original filename in metadata
      Metadata: {
        originalFilename: file.name,
      },
    });

    console.log("[R2 Upload] Sending to R2...");
    const result = await r2Client.send(command);
    console.log("[R2 Upload] Upload successful:", {
      key: filename,
      etag: result.ETag,
    });

    return filename;
  } catch (error: any) {
    console.error("[R2 Upload] Error uploading to R2:", {
      message: error.message,
      code: error.Code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      error: error,
    });
    throw error;
  }
}
