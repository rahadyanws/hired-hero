import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/resumes', // Folder penyimpanan lokal
    filename: (req, file, callback) => {
      // Format nama file: timestamp-random.pdf
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (file.mimetype === 'application/pdf') {
      callback(null, true);
    } else {
      callback(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5MB
  },
};
