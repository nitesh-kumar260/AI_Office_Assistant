import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Store files in memory buffer to keep raw binaries out of MongoDB
const storage = multer.memoryStorage();

// Maximum allowed file size: 15 MB
const MAX_FILE_SIZE = 15 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

// File extension fallback validation
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const fileExt = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

  if (ALLOWED_MIME_TYPES.includes(file.mimetype) || ALLOWED_EXTENSIONS.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type '${file.mimetype}'. Only PDF, DOC, DOCX, JPEG, and PNG files up to 15MB are allowed.`
      )
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});
