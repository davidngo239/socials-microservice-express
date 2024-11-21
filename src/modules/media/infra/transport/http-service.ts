import { config } from '@shared/components/config';
import { AppError } from '@shared/utils/error';
import { Request, Response } from 'express';
import fs from 'fs';

const ErrImageTooBig = AppError.from(new Error('image too big, max size is 512KB'), 400);
const ErrMediaNotFound = AppError.from(new Error('media not found'), 400);
export class MediaHttpService {
  constructor() { }

  async uploadMediaAPI(req: Request, res: Response) {

    const file = req.file as Express.Multer.File;
    if (!file) {
      throw ErrMediaNotFound;
    }

    if (file.size > 512 * 1024) {
      fs.unlinkSync(file.path);
      throw ErrImageTooBig;
    }

    const fileUploaded = {
      filename: file.originalname,
      url: `${config.upload.cdn}/${file.filename}`,
      ext: file.originalname.split('.').pop() || '',
      contentType: file.mimetype,
      size: file.size,
      file: file.buffer
    };

    res.status(200).json({ data: fileUploaded });
  }
}
