import { describe, it, expect } from "vitest";
import { validateMagicBytes, generateSafeStoragePath } from "@/lib/storage";

describe("Storage & Magic Bytes Security", () => {
  it("detects valid JPEG files by magic bytes", () => {
    const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const res = validateMagicBytes(jpegBytes);
    expect(res.isValid).toBe(true);
    expect(res.mimeType).toBe("image/jpeg");
  });

  it("detects valid PNG files by magic bytes", () => {
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const res = validateMagicBytes(pngBytes);
    expect(res.isValid).toBe(true);
    expect(res.mimeType).toBe("image/png");
  });

  it("detects valid PDF documents by magic bytes", () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35, 0x0a, 0x25, 0xd0, 0xd4]);
    const res = validateMagicBytes(pdfBytes);
    expect(res.isValid).toBe(true);
    expect(res.mimeType).toBe("application/pdf");
  });

  it("rejects malicious or invalid file signatures", () => {
    const corrupted = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b]);
    const res = validateMagicBytes(corrupted);
    expect(res.isValid).toBe(false);
  });

  it("generates safe, randomized user-isolated storage paths", () => {
    const path = generateSafeStoragePath("user-123", "licence", "application/pdf");
    expect(path.startsWith("user-123/licence_")).toBe(true);
    expect(path.endsWith(".pdf")).toBe(true);
    // Prevents directory traversal
    const pathWithDots = generateSafeStoragePath("user-123", "../malicious/../", "image/png");
    expect(pathWithDots.includes("..")).toBe(false);
  });
});
