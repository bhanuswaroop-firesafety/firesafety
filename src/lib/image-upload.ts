import { app } from "./firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { ProductItem } from "./types";

export interface ImageUploadResult {
  url: string;
  isStorageUrl: boolean;
  originalSizeKB: number;
  compressedSizeKB: number;
  fileName: string;
}

/**
 * Modern smartphones & DSLRs capture 12MB - 30MB photos.
 * We set the acceptance limit to 35 MB and auto-compress on the client before upload.
 */
export const MAX_IMAGE_SIZE_MB = 35;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

// Firestore has a hard limit of 1,048,576 bytes (1 MiB) per document.
export const FIRESTORE_MAX_DOC_SIZE_BYTES = 1048576;
export const FIRESTORE_SAFE_DOC_LIMIT_KB = 800; // Safe threshold before warning

/**
 * Compresses an image file client-side using an HTML5 Canvas.
 * - Resizes images to maxDimension preserving aspect ratio.
 * - Compresses to WebP (fallback to JPEG).
 * - Drastically reduces 10MB-35MB photos down to ~35KB-120KB for fast loading and Firestore safety.
 */
export async function compressImage(
  file: File,
  maxDimension = 1200,
  quality = 0.82,
): Promise<{ blob: Blob; dataUrl: string; sizeKB: number }> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      `Image file size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of ${MAX_IMAGE_SIZE_MB} MB. Please select an image under ${MAX_IMAGE_SIZE_MB} MB.`,
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () =>
        reject(new Error("Invalid image format. Please upload JPG, PNG, or WebP."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

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
          reject(new Error("Could not initialize 2D canvas context."));
          return;
        }

        // High quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, canvas fallback to JPEG
        const outputMime = "image/webp";
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to jpeg if webp canvas export failed
              canvas.toBlob(
                (fallbackBlob) => {
                  if (!fallbackBlob) {
                    reject(new Error("Failed to compress image canvas."));
                    return;
                  }
                  const dataUrl = canvas.toDataURL("image/jpeg", quality);
                  const sizeKB = Math.round(fallbackBlob.size / 1024);
                  resolve({ blob: fallbackBlob, dataUrl, sizeKB });
                },
                "image/jpeg",
                quality,
              );
              return;
            }
            const dataUrl = canvas.toDataURL(outputMime, quality);
            const sizeKB = Math.round(blob.size / 1024);
            resolve({ blob, dataUrl, sizeKB });
          },
          outputMime,
          quality,
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Attempts upload to Firebase Storage with automatic fallback bucket URL resolution.
 */
async function uploadToFirebaseStorage(
  uniquePath: string,
  blob: Blob,
  fileName: string,
): Promise<string> {
  const bucketsToTry = [
    // 1. Default configured storage bucket
    undefined,
    // 2. Explicit .firebasestorage.app bucket
    "gs://sri-udharchi-enterprises-c3be7.firebasestorage.app",
    // 3. Alternative standard GCP appspot.com bucket
    "gs://sri-udharchi-enterprises-c3be7.appspot.com",
  ];

  let lastError: unknown = null;

  for (const bucket of bucketsToTry) {
    try {
      const storage = bucket ? getStorage(app, bucket) : getStorage(app);
      const storageRef = ref(storage, uniquePath);
      await uploadBytes(storageRef, blob, {
        contentType: blob.type || "image/webp",
        customMetadata: {
          originalName: fileName,
          compressed: "true",
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
 * Uploads a single product image.
 * 1. Automatically compresses image client-side to optimized WebP.
 * 2. Uploads to Firebase Storage `products/` path to obtain permanent CDN download URL.
 * 3. If Firebase Storage has permission/CORS restrictions, safely falls back to a strongly
 *    compressed data URL (~30KB) so the product can still be saved directly.
 */
export async function uploadProductImage(file: File): Promise<ImageUploadResult> {
  const originalSizeKB = Math.round(file.size / 1024);

  // Compress for storage upload
  const { blob, dataUrl, sizeKB: compressedSizeKB } = await compressImage(file, 1200, 0.82);

  const cleanFileName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-");
  const uniquePath = `products/${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanFileName}`;

  try {
    const downloadUrl = await uploadToFirebaseStorage(uniquePath, blob, file.name);
    return {
      url: downloadUrl,
      isStorageUrl: true,
      originalSizeKB,
      compressedSizeKB,
      fileName: file.name,
    };
  } catch (storageErr) {
    console.warn("Firebase Storage direct upload skipped, using ultra-optimized compressed image:", storageErr);

    // If falling back to data URL, generate a more compact version (max 900px, 0.72 quality)
    // to strictly preserve Firestore document size limits when storing multiple images!
    try {
      const compact = await compressImage(file, 900, 0.72);
      return {
        url: compact.dataUrl,
        isStorageUrl: false,
        originalSizeKB,
        compressedSizeKB: compact.sizeKB,
        fileName: file.name,
      };
    } catch {
      return {
        url: dataUrl,
        isStorageUrl: false,
        originalSizeKB,
        compressedSizeKB,
        fileName: file.name,
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
    // Approximate byte length for UTF-8 string
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
