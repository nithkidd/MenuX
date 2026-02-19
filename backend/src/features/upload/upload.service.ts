import cloudinary from "../../config/cloudinary.js";
import { Readable } from "stream";
import {
  optimizeLogo,
  optimizeMenuItem,
  compressImage,
} from "../../shared/utils/image-compression.js";

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  compressionRatio?: number;
  originalSize?: number;
  compressedSize?: number;
}

export class UploadService {
  /**
   * Upload a logo with optimal compression
   * - Resizes to max 800x800px
   * - Quality: 90%
   * - Format: WebP
   */
  async uploadLogo(
    fileBuffer: Buffer,
    fileName: string,
    userId: string,
  ): Promise<UploadResult> {
    console.log("🖼️  Compressing logo...");
    const compressed = await optimizeLogo(fileBuffer);
    const generatedFileName = this.generateFileName(userId, fileName);

    const result = await this.uploadFile(
      "logos",
      compressed.buffer,
      generatedFileName,
    );

    return {
      ...result,
      compressionRatio: compressed.compressionRatio,
      originalSize: compressed.originalSize,
      compressedSize: compressed.compressedSize,
    };
  }

  /**
   * Upload a menu item image with optimal compression
   * - Resizes to max 1200x1200px
   * - Quality: 85%
   * - Format: WebP
   */
  async uploadMenuItemImage(
    fileBuffer: Buffer,
    fileName: string,
    userId: string,
  ): Promise<UploadResult> {
    console.log("🖼️  Compressing menu item image...");
    const compressed = await optimizeMenuItem(fileBuffer);
    const generatedFileName = this.generateFileName(userId, fileName);

    const result = await this.uploadFile(
      "menu-images",
      compressed.buffer,
      generatedFileName,
    );

    return {
      ...result,
      compressionRatio: compressed.compressionRatio,
      originalSize: compressed.originalSize,
      compressedSize: compressed.compressedSize,
    };
  }

  /**
   * Upload a file to Cloudinary using upload_stream
   * Incorporates safety and performance optimizations:
   * - f_auto: Automatically serves the best format (WebP/AVIF)
   * - q_auto: Automatically optimizes quality
   * - limit: Resizes if image is too large (prevents serving massive raw images)
   */
  async uploadFile(
    folder: string,
    fileBuffer: Buffer,
    fileName: string, // Used for public_id context (optional)
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `menux/${folder}`,
          public_id: fileName
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9]/g, "_"), // Sanitize public_id
          resource_type: "image",
          transformation: [
            { width: 2000, height: 2000, crop: "limit" }, // Optimize max dimensions
            { quality: "auto", fetch_format: "auto" }, // Optimize quality and format
          ],
          // Pre-generate a smaller variant to avoid slow first fetches
          eager: [
            {
              width: 800,
              height: 800,
              crop: "limit",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(new Error("Image upload failed"));
          }

          if (!result) {
            return reject(new Error("Image upload failed - no result"));
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
          });
        },
      );

      // Convert buffer to stream and pipe to Cloudinary
      const stream = Readable.from(fileBuffer);
      stream.pipe(uploadStream);
    });
  }

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      return false;
    }
  }

  /**
   * Generate a unique filename context (optional since Cloudinary handles uniqueness,
   * but good for organization)
   */
  generateFileName(userId: string, originalName: string): string {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
    return `${userId}_${timestamp}_${sanitizedName}`;
  }

  /**
   * Upload a file from a remote URL
   */
  async uploadFileFromUrl(
    folder: string,
    url: string,
    fileName: string,
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        url,
        {
          folder: `menux/${folder}`,
          public_id: fileName
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9]/g, "_"),
          resource_type: "image",
          transformation: [
            { width: 2000, height: 2000, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
          eager: [
            {
              width: 800,
              height: 800,
              crop: "limit",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary URL upload error:", error);
            return reject(new Error("Failed to upload image from URL"));
          }

          if (!result) {
            return reject(new Error("Image upload failed - no result"));
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
          });
        },
      );
    });
  }
}

export const uploadService = new UploadService();
