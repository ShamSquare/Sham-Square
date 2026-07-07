/**
 * Validation Utility
 * Common validation functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate UUID format
 */
export const isValidUUID = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Validate FCM token format
 */
export const isValidFCMToken = (token: string): boolean => {
  // FCM tokens are typically long strings, let's validate minimum length
  return token && token.length > 100 as any;
};

/**
 * Validate phone number format (international format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Basic international phone format validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain numbers');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain special characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate file size
 */
export const isValidFileSize = (fileSizeInBytes: number, maxSizeInBytes: number): boolean => {
  return fileSizeInBytes <= maxSizeInBytes;
};

/**
 * Validate file type (by MIME type)
 */
export const isValidFileType = (mimeType: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(mimeType);
};

/**
 * Validate image file
 */
export const isValidImageFile = (mimeType: string): boolean => {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return validImageTypes.includes(mimeType);
};

/**
 * Validate ISO date string
 */
export const isValidISODate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validate coupon code format
 */
export const isValidCouponCode = (code: string): boolean => {
  // Alphanumeric, 3-20 characters
  return /^[A-Z0-9]{3,20}$/.test(code);
};

/**
 * Validate price format
 */
export const isValidPrice = (price: number): boolean => {
  return price > 0 && Number.isFinite(price) && price % 0.01 === 0;
};

/**
 * Validate discount percentage
 */
export const isValidDiscountPercentage = (percentage: number): boolean => {
  return percentage > 0 && percentage <= 100;
};

/**
 * Sanitize user input string
 */
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"'`]/g, '') // Remove potential XSS characters
    .substring(0, 1000); // Limit length
};

/**
 * Validate UUID v4
 */
export const isValidUUIDv4 = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate JWT format (basic check)
 */
export const isValidJWTFormat = (token: string): boolean => {
  const parts = token.split('.');
  return parts.length === 3 && parts.every((part) => part.length > 0);
};

export const isValidObjectId = isValidUUID;

export default {
  isValidEmail,
  isValidUrl,
  isValidObjectId,
  isValidUUID,
  isValidFCMToken,
  isValidPhoneNumber,
  isStrongPassword,
  isValidFileSize,
  isValidFileType,
  isValidImageFile,
  isValidISODate,
  isValidCouponCode,
  isValidPrice,
  isValidDiscountPercentage,
  sanitizeString,
  isValidUUIDv4,
  isValidJWTFormat,
};
