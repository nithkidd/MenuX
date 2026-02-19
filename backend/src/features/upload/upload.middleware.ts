import multer from "multer";
import { Request } from "express";

// Strict file filter for images only
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
      ),
    );
  }
};

// Configure multer for memory storage with strict limits
// Increased to 10MB since we compress images server-side before uploading
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (will be compressed to much smaller size)
    files: 1, // Max 1 file per request
  },
});
