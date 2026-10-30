import { createClient } from "./supabase/server";

export type AllowedMimeType = "image/jpeg" | "image/png" | "image/webp" | "application/pdf";

/**
 * Validate file type using real magic bytes from the binary buffer
 */
export function validateMagicBytes(buffer: Uint8Array): { isValid: boolean; mimeType?: AllowedMimeType } {
  if (buffer.length < 12) {
    return { isValid: false };
  }

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, mimeType: "image/jpeg" };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, mimeType: "image/png" };
  }

  // 3. WEBP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { isValid: true, mimeType: "image/webp" };
  }

  // 4. PDF: 25 50 44 46 (%PDF)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { isValid: true, mimeType: "application/pdf" };
  }

  return { isValid: false };
}

/**
 * Generate a clean, randomized safe file path for uploads: {userId}/{type}-{randomId}.{ext}
 */
export function generateSafeStoragePath(
  userId: string,
  prefix: string,
  mimeType: AllowedMimeType
): string {
  const extensionMap: Record<AllowedMimeType, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };

  const ext = extensionMap[mimeType];
  const randomSuffix = crypto.randomUUID().slice(0, 8);
  const sanitizedPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, "");

  return `${userId}/${sanitizedPrefix}_${randomSuffix}.${ext}`;
}

/**
 * Generate a short-lived signed URL for reading private rider documents
 */
export async function getSignedDocumentUrl(
  path: string,
  expiresInSeconds = 300
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("rider-docs")
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data) {
    console.error("Error generating signed URL for document:", error);
    return null;
  }

  return data.signedUrl;
}

