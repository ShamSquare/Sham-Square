/**
 * Error Handling Utility
 * Standardized error handling and responses
 */

export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export interface IErrorResponse {
  success: false;
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ISuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create error response
 */
export const createErrorResponse = (
  code: ErrorCode,
  message: string,
  details?: any
): IErrorResponse => {
  return {
    success: false,
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Create success response
 */
export const createSuccessResponse = <T>(data: T, message?: string): ISuccessResponse<T> => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Create validation error response
 */
export const createValidationErrorResponse = (errors: Record<string, string>): IErrorResponse => {
  return createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Validation failed', errors);
};

/**
 * Get HTTP status code for error code
 */
export const getHttpStatusCode = (code: ErrorCode): number => {
  const statusCodeMap: Record<ErrorCode, number> = {
    [ErrorCode.BAD_REQUEST]: 400,
    [ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.NOT_FOUND]: 404,
    [ErrorCode.CONFLICT]: 409,
    [ErrorCode.VALIDATION_ERROR]: 422,
    [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
    [ErrorCode.SERVICE_UNAVAILABLE]: 503,
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  };

  return statusCodeMap[code] || 500;
};

/**
 * Throw bad request error
 */
export const throwBadRequest = (message: string, details?: any): never => {
  throw new AppError(ErrorCode.BAD_REQUEST, 400, message, details);
};

/**
 * Throw unauthorized error
 */
export const throwUnauthorized = (message: string = 'Unauthorized'): never => {
  throw new AppError(ErrorCode.UNAUTHORIZED, 401, message);
};

/**
 * Throw forbidden error
 */
export const throwForbidden = (message: string = 'Forbidden'): never => {
  throw new AppError(ErrorCode.FORBIDDEN, 403, message);
};

/**
 * Throw not found error
 */
export const throwNotFound = (resource: string): never => {
  throw new AppError(ErrorCode.NOT_FOUND, 404, `${resource} not found`);
};

/**
 * Throw conflict error
 */
export const throwConflict = (message: string, details?: any): never => {
  throw new AppError(ErrorCode.CONFLICT, 409, message, details);
};

/**
 * Throw validation error
 */
export const throwValidationError = (errors: Record<string, string>): never => {
  throw new AppError(ErrorCode.VALIDATION_ERROR, 422, 'Validation failed', errors);
};

/**
 * Throw internal server error
 */
export const throwInternalServerError = (message: string = 'Internal server error'): never => {
  throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 500, message);
};

/**
 * Throw service unavailable error
 */
export const throwServiceUnavailable = (message: string = 'Service unavailable'): never => {
  throw new AppError(ErrorCode.SERVICE_UNAVAILABLE, 503, message);
};

/**
 * Throw rate limit exceeded error
 */
export const throwRateLimitExceeded = (retryAfter?: number): never => {
  const error = new AppError(
    ErrorCode.RATE_LIMIT_EXCEEDED,
    429,
    'Rate limit exceeded. Please try again later.',
    { retryAfter }
  );
  throw error;
};

/**
 * Format error for logging
 */
export const formatErrorForLog = (error: Error | AppError): string => {
  if (error instanceof AppError) {
    return `[${error.code}] ${error.message}`;
  }
  return error.message;
};

/**
 * Check if error is an AppError
 */
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

export default {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
  getHttpStatusCode,
  throwBadRequest,
  throwUnauthorized,
  throwForbidden,
  throwNotFound,
  throwConflict,
  throwValidationError,
  throwInternalServerError,
  throwServiceUnavailable,
  throwRateLimitExceeded,
  formatErrorForLog,
  isAppError,
};
