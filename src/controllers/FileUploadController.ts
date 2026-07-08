/**
 * File Upload Controller
 * Handles image and file uploads to Cloudinary
 */

import { Request, Response } from 'express';
import cloudinaryService, { ImageFolder } from '../services/CloudinaryService.ts';
import { AppError } from '../utils/app-error.util.ts';
import { validateUploadedFile } from '../utils/fileUpload.util.ts';
import fs from 'fs/promises';
import path from 'path';
import { BaseController } from './BaseController.ts';

export class FileUploadController extends BaseController {
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

    const result = await cloudinaryService.uploadImageFromUrl(fileUrl, target, resourceId ? String(resourceId) : undefined);

    return this.sendSuccess(res, result);
  }

  async uploadByFile(req: Request, res: Response) {
    const { folder = 'users', resourceId } = req.body as any;
    if (!req.file) throw new AppError('No file uploaded', 400);

    // Validate file
    const fileMetadata = {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    };

    const validation = validateUploadedFile(fileMetadata);
    if (!validation.valid) {
      throw new AppError(validation.error || 'Invalid file', 400);
    }

    // map folder
    const folderMap: Record<string, ImageFolder> = {
      users: ImageFolder.USERS,
      products: ImageFolder.PRODUCTS,
      categories: ImageFolder.CATEGORIES,
      banners: ImageFolder.BANNERS,
    };

    const target = folderMap[folder] ?? ImageFolder.USERS;
    const filePath = req.file.path;

    try {
      const result = await cloudinaryService.uploadImage(filePath, target, resourceId ? String(resourceId) : undefined);

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
    if (!req.files || Object.keys(req.files).length === 0) throw new AppError('No files uploaded', 400);

    // Get all files from the object array
    const filesArray = Object.values(req.files).flat();
    if (filesArray.length === 0) throw new AppError('No files uploaded', 400);

    // Validate all files
    for (const file of filesArray) {
      const validation = validateUploadedFile({
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
      });
      if (!validation.valid) {
        throw new AppError(`Invalid file: ${validation.error}`, 400);
      }
    }

    // map folder
    const folderMap: Record<string, ImageFolder> = {
      users: ImageFolder.USERS,
      products: ImageFolder.PRODUCTS,
      categories: ImageFolder.CATEGORIES,
      banners: ImageFolder.BANNERS,
    };

    const target = folderMap['files'] ?? ImageFolder.USERS;
    const filePaths = filesArray.map(f => f.path);

    try {
      const results = await Promise.all(
        filesArray.map(async (file, index) => {
          const resourceIdWithIndex = `batch_${index + 1}`;
          return await cloudinaryService.uploadImage(file.path, target, resourceIdWithIndex);
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

export const fileUploadController = new FileUploadController();
