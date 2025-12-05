"use server";

import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

export async function uploadFileToR2(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExtension = file.name.split(".").pop();
  const fileName = `${nanoid()}.${fileExtension}`;
  const contentType = file.type;

  try {
    console.log(`[Upload] Starting upload to bucket: ${R2_BUCKET_NAME}`);
    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
      })
    );
    console.log(`[Upload] Success: ${fileName}`);

    // Construct the public URL
    // Note: You might need to configure a custom domain or use the R2.dev subdomain
    // For now using the public URL constant if defined, or constructing one
    const url = `${R2_PUBLIC_URL}/${fileName}`;

    return {
      success: true,
      url,
      name: file.name,
      type: file.type,
      size: file.size,
    };
  } catch (error) {
    console.error("Error uploading to R2:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to upload file" 
    };
  }
}
