import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadController } from './upload.controller.js';
import { AuthRequest } from '../../shared/middleware/auth.middleware.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload management
 */

/**
 * @swagger
 * /upload/logo:
 *   post:
 *     summary: Upload a business logo
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 */
// Upload routes (all protected)
router.post('/logo', upload.single('file'), (req: Request, res: Response) => 
  uploadController.uploadLogo(req as unknown as AuthRequest, res)
);

/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: Upload a menu item image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
router.post('/image', upload.single('file'), (req: Request, res: Response) => 
  uploadController.uploadImage(req as unknown as AuthRequest, res)
);

export default router;
