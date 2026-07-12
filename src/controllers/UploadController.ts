import { Request, Response } from 'express';
import cloudinaryService, { ImageFolder } from '../services/CloudinaryService.ts';
import { AppError } from '../utils/app-error.util.ts';
import fs from 'fs/promises';
import path from 'path';
import { BaseController } from './BaseController.ts';

/**
 * @deprecated Use FileUploadController instead.
 * This controller is kept for backward compatibility.
 */
export class UploadController extends BaseController {
  async uploadByUrl(req: Request, res: Response) {
    const { fileUrl, folder = 'users', resourceId } = req.body as any;
    if (!fileUrl) throw new AppError('Missing fileUrl', 400);

    const folderMap: Record<string, ImageFolder> = {
      users: ImageFolder.USERS,
      products: ImageFolder.PRODUCTS,
      categories: ImageFolder.CATEGORIES,
      banners: ImageFolder.BANNERS,
    };

    const target = folderMap[folder] ?? ImageFolder.USERS;

    const result = await cloudinaryService.uploadImageFromUrl(fileUrl, target, resourceId ? String(resourceId) : undefined);

    return this.sendSuccess(res, result);
  }

  async uploadByFile(req: Request, res: Response) {
    const { folder = 'users', resourceId } = req.body as any;
    if (!req.file) throw new AppError('No file uploaded', 400);

    const folderMap: Record<string, ImageFolder> = {
      users: ImageFolder.USERS,
      products: ImageFolder.PRODUCTS,
      categories: ImageFolder.CATEGORIES,
      banners: ImageFolder.BANNERS,
    };

    const target = folderMap[folder] ?? ImageFolder.USERS;
    const filePath = req.file.path;

    try {
      let result;
      if (req.file.mimetype.startsWith('image/')) {
        result = await cloudinaryService.uploadImage(filePath, target, resourceId ? String(resourceId) : undefined);
      } else {
        throw new AppError('File must be an image', 400);
      }

      return this.sendSuccess(res, {
        url: result.secureUrl,
        publicId: result.publicId,
        filename: req.file.originalname,
      });
    } finally {
      try {
        await fs.unlink(filePath);
      } catch {
        // ignore cleanup errors
      }
    }
  }

  async uploadMultiple(req: Request, res: Response) {
    const { folder = 'users', resourceId } = req.body as any;
    if (!req.files) throw new AppError('No files uploaded', 400);

    const filesArray: Express.Multer.File[] = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files).flat();
    if (filesArray.length === 0) throw new AppError('No files uploaded', 400);

    const folderMap: Record<string, ImageFolder> = {
      users: ImageFolder.USERS,
      products: ImageFolder.PRODUCTS,
      categories: ImageFolder.CATEGORIES,
      banners: ImageFolder.BANNERS,
    };

    const target = folderMap[folder] ?? ImageFolder.USERS;
    const filePaths = filesArray.map(f => f.path);

    try {
      const results = await Promise.all(
        filePaths.map(async (filePath, index) => {
          const resourceIdWithIndex = resourceId ? `${resourceId}_${index + 1}` : undefined;
          return await cloudinaryService.uploadImage(filePath, target, resourceIdWithIndex);
        })
      );

      return this.sendSuccess(res, results.map(r => ({
        url: r.secureUrl,
        publicId: r.publicId,
        filename: path.basename(filePaths[results.indexOf(r)]),
      })));
    } finally {
      for (const filePath of filePaths) {
        try {
          await fs.unlink(filePath);
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }
}

export const uploadController = new UploadController();
