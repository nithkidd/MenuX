import { supabaseAdmin } from '../../config/supabase.js';

export interface UploadResult {
  url: string;
  path: string;
}

export class UploadService {
  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    bucket: string,
    filePath: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<UploadResult> {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(bucket: string, filePath: string): Promise<boolean> {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Delete file error:', error);
      return false;
    }

    return true;
  }

  /**
   * Generate a unique file path for upload
   */
  generateFilePath(userId: string, originalName: string): string {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${userId}/${timestamp}-${sanitizedName}`;
  }
}

export const uploadService = new UploadService();
