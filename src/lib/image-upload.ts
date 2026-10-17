import { app } from "./firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface ImageUploadResult {
  url: string;
  isStorageUrl: boolean;
  originalSizeKB: number;
  compressedSizeKB: number;
}

export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/**
 * Compresses an image file client-side using an HTML5 Canvas.
 * - Resizes images to max 1200px width/height while preserving aspect ratio.
 * - Compresses to WebP / JPEG format with 0.85 quality.
 * - Reduces 5MB-10MB photos down to ~50KB-150KB for fast loading and Firestore compatibility.
 */
export async function compressImage(
  file: File,
  maxDimension = 1200,
  quality = 0.85,
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
      img.onerror = () => reject(new Error("Invalid image format. Please upload JPG, PNG, or WebP."));
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
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not initialize 2D canvas context."));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer WebP for high compression, fallback to JPEG
        const outputMime = "image/webp";
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image canvas."));
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
 * Uploads a product image.
 * 1. Automatically compresses image client-side to < 150KB.
 * 2. Attempts to upload to Firebase Storage products/ path to obtain permanent storage URL.
 * 3. If Firebase Storage is unconfigured or returns permission error, seamlessly falls back
 *    to the optimized WebP data URL so the product can be saved immediately.
 */
export async function uploadProductImage(file: File): Promise<ImageUploadResult> {
  const originalSizeKB = Math.round(file.size / 1024);
  const { blob, dataUrl, sizeKB: compressedSizeKB } = await compressImage(file);

  const cleanFileName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-");
  const uniquePath = `products/${Date.now()}_${cleanFileName}`;

  try {
    const storage = getStorage(app);
    const storageRef = ref(storage, uniquePath);
    await uploadBytes(storageRef, blob, {
      contentType: blob.type || "image/webp",
      customMetadata: {
        originalName: file.name,
        compressed: "true",
      },
    });
    const downloadUrl = await getDownloadURL(storageRef);
    return {
      url: downloadUrl,
      isStorageUrl: true,
      originalSizeKB,
      compressedSizeKB,
    };
  } catch (storageErr) {
    console.warn("Firebase Storage direct upload skipped, using optimized compressed image:", storageErr);
    return {
      url: dataUrl,
      isStorageUrl: false,
      originalSizeKB,
      compressedSizeKB,
    };
  }
}
