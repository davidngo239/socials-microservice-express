import { Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import { MediaHttpService } from './infra/transport/http-service';

export const setupMediaModule = () => {
  const httpService = new MediaHttpService();
  const router = Router();

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = 'uploads';
      ensureDirectoryExistence(uploadPath);
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const hrtime = process.hrtime();
      const prefix = `${hrtime[0] * 1e6}`;
      cb(null, `${prefix}_${file.originalname}`);
    }
  });
  const upload = multer({ storage });

  router.post('/upload-file', upload.single('file'), httpService.uploadMediaAPI.bind(httpService));

  return router;
};

export const ensureDirectoryExistence = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};
