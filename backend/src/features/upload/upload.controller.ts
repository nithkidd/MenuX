import { Response } from 'express';
import { uploadService } from './upload.service.js';
import { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import { ApiResponse } from '../../shared/types/index.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export class UploadController {
  /**
   * POST /upload/logo - Upload business logo
   */
  async uploadLogo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: 'No file provided',
        } as ApiResponse);
        return;
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        res.status(400).json({
          success: false,
          error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF',
        } as ApiResponse);
        return;
      }

      // Validate file size
      if (file.size > MAX_SIZE) {
        res.status(400).json({
          success: false,
          error: 'File too large. Maximum size: 5MB',
        } as ApiResponse);
        return;
      }

      const filePath = uploadService.generateFilePath(req.user.id, file.originalname);
      const result = await uploadService.uploadFile('logos', filePath, file.buffer, file.mimetype);

      res.json({
        success: true,
        data: result,
        message: 'Logo uploaded successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Upload logo error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload logo',
      } as ApiResponse);
    }
  }

  /**
   * POST /upload/image - Upload menu item image
   */
  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: 'No file provided',
        } as ApiResponse);
        return;
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        res.status(400).json({
          success: false,
          error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF',
        } as ApiResponse);
        return;
      }

      // Validate file size
      if (file.size > MAX_SIZE) {
        res.status(400).json({
          success: false,
          error: 'File too large. Maximum size: 5MB',
        } as ApiResponse);
        return;
      }

      const filePath = uploadService.generateFilePath(req.user.id, file.originalname);
      const result = await uploadService.uploadFile('menu-images', filePath, file.buffer, file.mimetype);

      res.json({
        success: true,
        data: result,
        message: 'Image uploaded successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Upload image error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload image',
      } as ApiResponse);
    }
  }
}

export const uploadController = new UploadController();
