import { S3Client } from "@aws-sdk/client-s3";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_UPLOAD_IMAGE_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY;

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.warn("⚠️ R2 Configuration Missing: Check your .env file for CLOUDFLARE_ACCOUNT_ID, R2_UPLOAD_IMAGE_ACCESS_KEY_ID, and R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY");
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

export const R2_BUCKET_NAME = process.env.R2_UPLOAD_IMAGE_BUCKET_NAME || "dccpportal";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-446b40f3671f408b944002c8c4792d7b.r2.dev";
