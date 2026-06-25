/**
 * File Upload Utility
 * Handle file uploads and validations
 */

import envConfig from '../config/env.config.ts';
import { isValidImageFile, isValidFileSize } from './validation.util.ts';

export interface IFileValidationResult {
  valid: boolean;
  error?: string;
}

export interface IFileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}

/**
 * Validate uploaded file
 */
export const validateUploadedFile = (file: IFileMetadata): IFileValidationResult => {
  // Check file size
  if (!isValidFileSize(file.size, envConfig.upload.maxFileSize)) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${envConfig.upload.maxFileSize / 1024 / 1024}MB`,
    };
  }

  // Check file type for images
  if (!isValidImageFile(file.mimeType)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed',
    };
  }

  return { valid: true };
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Get MIME type from file extension
 */
export const getMimeTypeFromExtension = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  return mimeTypes[extension] || 'application/octet-stream';
};

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalName);

  return `${timestamp}_${random}.${extension}`;
};

/**
 * Get file size in MB
 */
export const getFileSizeInMB = (sizeInBytes: number): number => {
  return Math.round((sizeInBytes / 1024 / 1024) * 100) / 100;
};

/**
 * Check if file is an image
 */
export const isImageFile = (mimeType: string): boolean => {
  return isValidImageFile(mimeType);
};

/**
 * Check if file is a document
 */
export const isDocumentFile = (mimeType: string): boolean => {
  const documentMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ];

  return documentMimeTypes.includes(mimeType);
};

/**
 * Sanitize filename
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special characters with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 255); // Limit length
};

/**
 * Get allowed file extensions
 */
export const getAllowedImageExtensions = (): string[] => {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'];
};

/**
 * Get allowed document extensions
 */
export const getAllowedDocumentExtensions = (): string[] => {
  return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'];
};

/**
 * Format file upload error message
 */
export const formatUploadErrorMessage = (error: string, filename: string): string => {
  return `Upload failed for ${filename}: ${error}`;
};

/**
 * Create file metadata object
 */
export const createFileMetadata = (
  originalName: string,
  mimeType: string,
  size: number,
  path: string
): IFileMetadata => {
  return {
    originalName,
    mimeType,
    size,
    path,
  };
};

export default {
  validateUploadedFile,
  getFileExtension,
  getMimeTypeFromExtension,
  generateUniqueFilename,
  getFileSizeInMB,
  isImageFile,
  isDocumentFile,
  sanitizeFilename,
  getAllowedImageExtensions,
  getAllowedDocumentExtensions,
  formatUploadErrorMessage,
  createFileMetadata,
};
