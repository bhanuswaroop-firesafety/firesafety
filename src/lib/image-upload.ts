import { app } from "./firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { ProductItem } from "./types";

export interface ImageUploadResult {
  url: string;
  isStorageUrl: boolean;
  originalSizeKB: number;
  compressedSizeKB: number;
  fileName: string;
  wasCompressed?: boolean;
}

/**
 * Modern smartphones & DSLRs capture 12MB - 30MB photos.
 * Maximum acceptance limit set to 35 MB.
 */
export const MAX_IMAGE_SIZE_MB = 35;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/**
 * 1 MB threshold:
 * Photos <= 1 MB (1024 KB) are uploaded in ORIGINAL quality without any compression.
 * Photos > 1 MB are compressed client-side to optimize upload speed and storage.
 */
export const ONE_MB_BYTES = 1024 * 1024;

// Firestore has a hard limit of 1,048,576 bytes (1 MiB) per document.
export const FIRESTORE_MAX_DOC_SIZE_BYTES = 1048576;
export const FIRESTORE_SAFE_DOC_LIMIT_KB = 800; // Safe threshold before warning

/**
 * Reads a File directly as a data URL without canvas processing or quality degradation.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image file client-side using an HTML5 Canvas.
 * - Resizes images to maxDimension preserving aspect ratio.
 * - Compresses to WebP (fallback to JPEG).
 * - High-speed processing using ObjectURL (avoids reading large files into base64).
 * - Protected by timeout to prevent hanging.
 */
export async function compressImage(
  file: File,
  maxDimension = 1400,
  quality = 0.82,
): Promise<{ blob: Blob; dataUrl: string; sizeKB: number }> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      `Image file size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of ${MAX_IMAGE_SIZE_MB} MB. Please select an image under ${MAX_IMAGE_SIZE_MB} MB.`,
    );
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    // 10s safety timeout to prevent hanging on corrupted or massive files
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image compression timed out."));
    }, 10000);

    const cleanup = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = () => {
      cleanup();
      reject(new Error("Invalid image format or failed to load image."));
    };

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width === 0 || height === 0) {
          cleanup();
          reject(new Error("Image has invalid dimensions."));
          return;
        }

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) {
          cleanup();
          reject(new Error("Could not initialize 2D canvas context."));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const exportFormat = (mime: string, fallbackMime?: string) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                if (fallbackMime) {
                  exportFormat(fallbackMime);
                  return;
                }
                cleanup();
                reject(new Error("Failed to export image canvas."));
                return;
              }
              try {
                const dataUrl = canvas.toDataURL(mime, quality);
                const sizeKB = Math.round(blob.size / 1024);
                cleanup();
                resolve({ blob, dataUrl, sizeKB });
              } catch {
                const sizeKB = Math.round(blob.size / 1024);
                cleanup();
                resolve({ blob, dataUrl: "", sizeKB });
              }
            },
            mime,
            quality,
          );
        };

        // Try WebP first, fallback to JPEG
        exportFormat("image/webp", "image/jpeg");
      } catch (err) {
        cleanup();
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    img.src = objectUrl;
  });
}

/**
 * Attempts upload to Firebase Storage with automatic fallback bucket URL resolution.
 */
async function uploadToFirebaseStorage(
  uniquePath: string,
  blobOrFile: Blob | File,
  fileName: string,
): Promise<string> {
  const bucketsToTry = [
    // 1. Default configured storage bucket
    undefined,
    // 2. Direct bucket names
    "sri-udharchi-enterprises-c3be7.firebasestorage.app",
    "sri-udharchi-enterprises-c3be7.appspot.com",
    // 3. gs:// bucket URIs
    "gs://sri-udharchi-enterprises-c3be7.firebasestorage.app",
    "gs://sri-udharchi-enterprises-c3be7.appspot.com",
  ];

  let lastError: unknown = null;

  for (const bucket of bucketsToTry) {
    try {
      const storage = bucket ? getStorage(app, bucket) : getStorage(app);
      const storageRef = ref(storage, uniquePath);
      await uploadBytes(storageRef, blobOrFile, {
        contentType: blobOrFile.type || "image/jpeg",
        customMetadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      });
      return await getDownloadURL(storageRef);
    } catch (err) {
      lastError = err;
      // Continue to next bucket candidate if bucket wasn't found
    }
  }

  throw lastError || new Error("Failed to upload to Firebase Storage.");
}

/**
 * Uploads a single product image adhering to user specification:
 * 1. If file is <= 1 MB, DO NOT compress. Upload original image directly.
 * 2. If file is > 1 MB, compress client-side to keep size optimal for Firebase upload.
 * 3. If compression fails on large images, seamlessly fallback to original file without breaking upload.
 * 4. Uploads to Firebase Storage `products/` path.
 * 5. If Firebase Storage has permission/network restrictions, safely falls back to data URL for Firestore.
 */
export async function uploadProductImage(file: File): Promise<ImageUploadResult> {
  const originalSizeKB = Math.round(file.size / 1024);

  const cleanFileName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-");
  const uniquePath = `products/${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanFileName}`;

  // REQUIREMENT 1: Do NOT compress images <= 1 MB. Keep original quality!
  if (file.size <= ONE_MB_BYTES) {
    try {
      const downloadUrl = await uploadToFirebaseStorage(uniquePath, file, file.name);
      return {
        url: downloadUrl,
        isStorageUrl: true,
        originalSizeKB,
        compressedSizeKB: originalSizeKB,
        fileName: file.name,
        wasCompressed: false,
      };
    } catch (storageErr) {
      console.warn("Firebase Storage direct upload skipped for <=1MB image, using direct data URL:", storageErr);
      const dataUrl = await fileToDataUrl(file);
      return {
        url: dataUrl,
        isStorageUrl: false,
        originalSizeKB,
        compressedSizeKB: originalSizeKB,
        fileName: file.name,
        wasCompressed: false,
      };
    }
  }

  // REQUIREMENT 2: For images > 1 MB, optimize/compress client-side
  let uploadBlob: Blob = file;
  let uploadDataUrl: string | null = null;
  let finalSizeKB = originalSizeKB;
  let wasCompressed = false;

  try {
    const compressed = await compressImage(file, 1400, 0.82);
    uploadBlob = compressed.blob;
    uploadDataUrl = compressed.dataUrl;
    finalSizeKB = compressed.sizeKB;
    wasCompressed = true;
  } catch (compErr) {
    console.warn("Image compression encountered an issue, uploading original image instead:", compErr);
    uploadBlob = file;
    finalSizeKB = originalSizeKB;
    wasCompressed = false;
  }

  try {
    const downloadUrl = await uploadToFirebaseStorage(uniquePath, uploadBlob, file.name);
    return {
      url: downloadUrl,
      isStorageUrl: true,
      originalSizeKB,
      compressedSizeKB: finalSizeKB,
      fileName: file.name,
      wasCompressed,
    };
  } catch (storageErr) {
    console.warn("Firebase Storage direct upload skipped, using data URL fallback:", storageErr);

    if (uploadDataUrl) {
      return {
        url: uploadDataUrl,
        isStorageUrl: false,
        originalSizeKB,
        compressedSizeKB: finalSizeKB,
        fileName: file.name,
        wasCompressed,
      };
    }

    try {
      const compact = await compressImage(file, 900, 0.72);
      return {
        url: compact.dataUrl,
        isStorageUrl: false,
        originalSizeKB,
        compressedSizeKB: compact.sizeKB,
        fileName: file.name,
        wasCompressed: true,
      };
    } catch {
      const rawDataUrl = await fileToDataUrl(file);
      return {
        url: rawDataUrl,
        isStorageUrl: false,
        originalSizeKB,
        compressedSizeKB: originalSizeKB,
        fileName: file.name,
        wasCompressed: false,
      };
    }
  }
}

/**
 * Uploads multiple product images concurrently with progress tracking.
 */
export async function uploadProductImages(
  files: File[],
  onProgress?: (completed: number, total: number) => void,
): Promise<ImageUploadResult[]> {
  const results: ImageUploadResult[] = [];
  let completed = 0;

  for (const file of files) {
    try {
      const res = await uploadProductImage(file);
      results.push(res);
    } catch (err) {
      console.error(`Failed to process image ${file.name}:`, err);
    }
    completed++;
    if (onProgress) {
      onProgress(completed, files.length);
    }
  }

  return results;
}

/**
 * Calculates the total approximate JSON payload size of a ProductItem in KB.
 * Used to give real-time feedback to the admin and prevent hitting Firestore's 1 MB limit.
 */
export function calculateProductPayloadSizeKB(product: Partial<ProductItem>): {
  sizeKB: number;
  isSafe: boolean;
  isOverLimit: boolean;
  statusText: string;
} {
  try {
    const jsonStr = JSON.stringify(product || {});
    const bytes = new Blob([jsonStr]).size;
    const sizeKB = Math.round((bytes / 1024) * 10) / 10;
    const isOverLimit = bytes >= FIRESTORE_MAX_DOC_SIZE_BYTES;
    const isSafe = sizeKB < FIRESTORE_SAFE_DOC_LIMIT_KB;

    let statusText = "Optimal (Well within 1 MB limit)";
    if (isOverLimit) {
      statusText = "Exceeds 1 MB Firestore limit! Remove or upload to Cloud Storage.";
    } else if (!isSafe) {
      statusText = "Approaching 1 MB limit. Storing via Cloud Storage recommended.";
    }

    return { sizeKB, isSafe, isOverLimit, statusText };
  } catch {
    return { sizeKB: 0, isSafe: true, isOverLimit: false, statusText: "Unknown" };
  }
}
