import sharp from "sharp";

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
  maintainAspectRatio?: boolean;
}

export interface CompressionResult {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Compress an image buffer using sharp
 * - Reduces file size significantly
 * - Resizes if dimensions exceed limits
 * - Converts to optimal format (WebP by default)
 * - Maintains quality while reducing size
 */
export async function compressImage(
  buffer: Buffer,
  options: ImageCompressionOptions = {},
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 85,
    format = "webp",
    maintainAspectRatio = true,
  } = options;

  try {
    const originalSize = buffer.length;

    // Get original image metadata
    const metadata = await sharp(buffer).metadata();

    // Create sharp instance with resizing
    let pipeline = sharp(buffer);

    // Resize if image exceeds max dimensions
    if (metadata.width && metadata.height) {
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        pipeline = pipeline.resize(maxWidth, maxHeight, {
          fit: maintainAspectRatio ? "inside" : "cover",
          withoutEnlargement: true,
        });
      }
    }

    // Apply format-specific compression
    let compressedBuffer: Buffer;

    switch (format) {
      case "webp":
        compressedBuffer = await pipeline
          .webp({ quality, effort: 4 })
          .toBuffer();
        break;

      case "jpeg":
        compressedBuffer = await pipeline
          .jpeg({ quality, progressive: true, mozjpeg: true })
          .toBuffer();
        break;

      case "png":
        compressedBuffer = await pipeline
          .png({ quality, compressionLevel: 9, progressive: true })
          .toBuffer();
        break;

      default:
        compressedBuffer = await pipeline
          .webp({ quality, effort: 4 })
          .toBuffer();
    }

    // Get compressed image metadata
    const compressedMetadata = await sharp(compressedBuffer).metadata();
    const compressedSize = compressedBuffer.length;
    const compressionRatio =
      ((originalSize - compressedSize) / originalSize) * 100;

    console.log(
      `📦 Image compressed: ${(originalSize / 1024).toFixed(2)}KB → ${(compressedSize / 1024).toFixed(2)}KB (${compressionRatio.toFixed(1)}% reduction)`,
    );

    return {
      buffer: compressedBuffer,
      format: compressedMetadata.format || format,
      width: compressedMetadata.width || 0,
      height: compressedMetadata.height || 0,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  } catch (error) {
    console.error("Image compression error:", error);
    throw new Error("Failed to compress image");
  }
}

/**
 * Optimize image for logos (smaller dimensions, higher quality)
 */
export async function optimizeLogo(buffer: Buffer): Promise<CompressionResult> {
  return compressImage(buffer, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 90,
    format: "webp",
    maintainAspectRatio: true,
  });
}

/**
 * Optimize image for menu items (balanced size and quality)
 */
export async function optimizeMenuItem(
  buffer: Buffer,
): Promise<CompressionResult> {
  return compressImage(buffer, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 85,
    format: "webp",
    maintainAspectRatio: true,
  });
}

/**
 * Optimize image for thumbnails (small size, lower quality acceptable)
 */
export async function optimizeThumbnail(
  buffer: Buffer,
): Promise<CompressionResult> {
  return compressImage(buffer, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 80,
    format: "webp",
    maintainAspectRatio: true,
  });
}
