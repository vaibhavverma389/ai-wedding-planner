import multer from 'multer';

// Use memory storage to process buffers prior to uploading to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WEBP, and PDF.`
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max limit
  },
  fileFilter
});
