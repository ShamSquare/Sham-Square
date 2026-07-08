/**
 * Constants Utility
 * Shared constants used throughout the application
 */

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
};

// Cache TTL in seconds
export const CACHE_TTL = {
  VERY_SHORT: 60, // 1 minute
  SHORT: 300, // 5 minutes
  MEDIUM: 3600, // 1 hour
  LONG: 86400, // 24 hours
  VERY_LONG: 604800, // 7 days
};

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  VIDEO: 50 * 1024 * 1024, // 50MB
};

// Image upload folder mappings
export const UPLOAD_FOLDERS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SUBCATEGORIES: 'subcategories',
  USERS: 'users',
  BANNERS: 'banners',
  SUPPORT: 'support',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  ORDERS: '/api/orders',
  NOTIFICATIONS: '/api/notifications',
  COUPONS: '/api/coupons',
  SUPPORT: '/api/support',
  ADMIN: '/api/admin',
};

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
};

// Email constants
export const EMAIL = {
  FROM_NAME: 'AshityShop',
  FROM_EMAIL: 'noreply@ashityshop.com',
  VERIFICATION_EXPIRY_HOURS: 24,
  PASSWORD_RESET_EXPIRY_HOURS: 1,
};

// Notification constants
export const NOTIFICATION = {
  MAX_BATCH_SIZE: 500,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
};

// Order constants
export const ORDER = {
  PENDING_EXPIRY_HOURS: 24,
  PAYMENT_TIMEOUT_HOURS: 1,
};

// Coupon constants
export const COUPON = {
  MAX_DISCOUNT_PERCENTAGE: 100,
  MIN_PURCHASE_AMOUNT: 0,
};

// Rate limiting constants
export const RATE_LIMIT = {
  AUTH_LOGIN_ATTEMPTS: 5,
  AUTH_LOGIN_WINDOW_MINUTES: 15,
  API_REQUESTS_PER_MINUTE: 60,
  UPLOAD_PER_HOUR: 100,
};

// Token constants
export const TOKEN = {
  BEARER_PREFIX: 'Bearer ',
  HEADER_NAME: 'Authorization',
};

// Headers
export const HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  X_REQUESTED_WITH: 'X-Requested-With',
  X_API_KEY: 'X-API-Key',
};

// MIME types
export const MIME_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
};

// Regular expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  UUID_V4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  COUPON_CODE: /^[A-Z0-9]{3,20}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Sorting options
export const SORT_OPTIONS = {
  ASC: 1,
  DESC: -1,
};

// Time constants (in milliseconds)
export const TIME = {
  ONE_SECOND: 1000,
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  RESOURCE_NOT_FOUND: 'Resource not found',
  UNAUTHORIZED_ACCESS: 'Unauthorized access',
  INVALID_INPUT: 'Invalid input provided',
  SERVER_ERROR: 'An error occurred while processing your request',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  USER_ALREADY_EXISTS: 'User already exists',
  EMAIL_ALREADY_IN_USE: 'Email is already in use',
};

// Success messages
export const SUCCESS_MESSAGES = {
  OPERATION_SUCCESSFUL: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  LOGIN_SUCCESSFUL: 'Login successful',
  LOGOUT_SUCCESSFUL: 'Logout successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  PASSWORD_RESET_SUCCESSFUL: 'Password reset successfully',
};

export default {
  PAGINATION,
  CACHE_TTL,
  FILE_SIZE_LIMITS,
  API_ENDPOINTS,
  PASSWORD_REQUIREMENTS,
  EMAIL,
  NOTIFICATION,
  ORDER,
  COUPON,
  RATE_LIMIT,
  TOKEN,
  HEADERS,
  MIME_TYPES,
  REGEX,
  SORT_OPTIONS,
  TIME,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
