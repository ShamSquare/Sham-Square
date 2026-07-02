import { Request, Response } from 'express';
import cloudinaryService, { ImageFolder } from '../services/CloudinaryService.ts';
import { AppError } from '../utils/app-error.util.ts';

export class UploadController {
  async uploadByUrl(req: Request, res: Response) {
    const { fileUrl, folder = 'users', resourceId } = req.body as any;
    if (!fileUrl) throw new AppError('Missing fileUrl', 400);

    // map folder
    const folderMap: Record<string, ImageFolder> = {
      users: ImageFolder.USERS,
      products: ImageFolder.PRODUCTS,
      categories: ImageFolder.CATEGORIES,
      banners: ImageFolder.BANNERS,
    };

    const target = folderMap[folder] ?? ImageFolder.USERS;

    const result = await cloudinaryService.uploadImage(fileUrl, target, resourceId ? String(resourceId) : undefined);

    res.json({ success: true, data: result });
  }
}

export const uploadController = new UploadController();
