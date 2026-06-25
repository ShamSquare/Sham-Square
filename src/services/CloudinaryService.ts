/**
 * Cloudinary Service
 * Handle image upload, delete, and transformation
 */

import { v2 as cloudinary } from 'cloudinary';
import cloudinaryConfig from '../config/cloudinary.config.js';
import logger from '../utils/logger.util.js';

export interface IUploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
}

export interface IMultipleUploadResult {
  results: IUploadResult[];
  failedUploads: Array<{
    error: string;
    message: string;
  }>;
}

export enum ImageFolder {
  PRODUCTS = 'ashityshop/products',
  CATEGORIES = 'ashityshop/categories',
  SUBCATEGORIES = 'ashityshop/subcategories',
  USERS = 'ashityshop/users',
  BANNERS = 'ashityshop/banners',
  SUPPORT = 'ashityshop/support',
}

class CloudinaryService {
  /**
   * Initialize Cloudinary if not already done
   */
  private ensureInitialized(): void {
    if (!cloudinaryConfig.isInitialized()) {
      cloudinaryConfig.initialize();
    }
  }

  /**
   * Upload single image
   */
  async uploadImage(
    filePath: string,
    folder: ImageFolder,
    publicId?: string
  ): Promise<IUploadResult> {
    try {
      this.ensureInitialized();

      const uploadOptions: any = {
        folder,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
        uploadOptions.overwrite = true;
      }

      const result = await cloudinary.uploader.upload(filePath, uploadOptions);

      logger.info(`Image uploaded: ${result.public_id}`);

      return {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      logger.error('Cloudinary upload error', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload product image
   */
  async uploadProductImage(filePath: string, productId: string): Promise<IUploadResult> {
    return this.uploadImage(filePath, ImageFolder.PRODUCTS, `product_${productId}_${Date.now()}`);
  }

  /**
   * Upload category image
   */
  async uploadCategoryImage(filePath: string, categoryId: string): Promise<IUploadResult> {
    return this.uploadImage(filePath, ImageFolder.CATEGORIES, `category_${categoryId}`);
  }

  /**
   * Upload user profile image
   */
  async uploadUserProfileImage(filePath: string, userId: string): Promise<IUploadResult> {
    return this.uploadImage(filePath, ImageFolder.USERS, `user_${userId}`);
  }

  /**
   * Upload banner image
   */
  async uploadBannerImage(filePath: string, bannerId: string): Promise<IUploadResult> {
    return this.uploadImage(filePath, ImageFolder.BANNERS, `banner_${bannerId}`);
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    filePaths: string[],
    folder: ImageFolder
  ): Promise<IMultipleUploadResult> {
    try {
      this.ensureInitialized();

      const results: IUploadResult[] = [];
      const failedUploads: Array<{ error: string; message: string }> = [];

      for (const filePath of filePaths) {
        try {
          const result = await this.uploadImage(filePath, folder);
          results.push(result);
        } catch (error) {
          failedUploads.push({
            error: filePath,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      logger.info(`Uploaded ${results.length} images, ${failedUploads.length} failed`);

      return {
        results,
        failedUploads,
      };
    } catch (error) {
      logger.error('Multiple upload error', error);
      throw new Error(
        `Failed to upload multiple images: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete image by publicId
   */
  async deleteImage(publicId: string): Promise<{ result: string }> {
    try {
      this.ensureInitialized();

      const result = await cloudinary.uploader.destroy(publicId);

      logger.info(`Image deleted: ${publicId}`);

      return { result: result.result };
    } catch (error) {
      logger.error('Cloudinary delete error', error);
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete multiple images
   */
  async deleteMultipleImages(publicIds: string[]): Promise<{ successCount: number; failureCount: number }> {
    try {
      this.ensureInitialized();

      let successCount = 0;
      let failureCount = 0;

      for (const publicId of publicIds) {
        try {
          await this.deleteImage(publicId);
          successCount++;
        } catch (error) {
          failureCount++;
          logger.warn(`Failed to delete image: ${publicId}`);
        }
      }

      logger.info(`Deleted ${successCount} images, ${failureCount} failed`);

      return { successCount, failureCount };
    } catch (error) {
      logger.error('Multiple delete error', error);
      throw new Error(
        `Failed to delete multiple images: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get image transformation URL
   */
  getTransformedUrl(publicId: string, options?: Record<string, any>): string {
    try {
      this.ensureInitialized();

      return cloudinary.url(publicId, {
        secure: true,
        ...options,
      });
    } catch (error) {
      logger.error('Transformation URL error', error);
      throw new Error(`Failed to generate transformation URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Resize image transformation
   */
  getResizedImageUrl(publicId: string, width: number, height: number, crop: string = 'fill'): string {
    return this.getTransformedUrl(publicId, {
      width,
      height,
      crop,
    });
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(publicId: string, size: number = 200): string {
    return this.getResizedImageUrl(publicId, size, size, 'thumb');
  }
}

export default new CloudinaryService();
