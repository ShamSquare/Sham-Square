import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.util';
import logger from '../utils/logger.util';
import { errorResponse } from '../utils/api-response.util';
import env from '../config/env.config';

// PostgreSQL error code to user-friendly message mapping
const PG_ERROR_MESSAGES: Record<string, { status: number; message: string; code: string }> = {
  '23502': { status: 400, message: 'A required field is missing. Please check your request body.', code: 'NOT_NULL_VIOLATION' },
  '23503': { status: 409, message: 'Referenced record not found. Please check foreign key values.', code: 'FOREIGN_KEY_VIOLATION' },
  '23505': { status: 409, message: 'A record with this value already exists.', code: 'CONFLICT' },
  '23514': { status: 400, message: 'A value violates a database constraint. Please check your input.', code: 'CHECK_VIOLATION' },
  '22P02': { status: 400, message: 'Invalid input format. Please check the data type of your values.', code: 'INVALID_INPUT_SYNTAX' },
  '42703': { status: 400, message: 'An undefined column was referenced in the request.', code: 'UNDEFINED_COLUMN' },
};

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log with request body for debugging
  logger.error('Request failed', {
    message: err?.message,
    stack: env.app.nodeEnv === 'development' ? err?.stack : undefined,
    method: req.method,
    path: req.originalUrl,
    statusCode: err?.statusCode,
    code: err?.code,
    body: req.method !== 'GET' ? req.body : undefined,
  });

  let statusCode = 500;
  let message = 'Internal Server Error';
  let code: string | undefined = 'INTERNAL_SERVER_ERROR';
  let errors: Record<string, any> | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  } else if (err?.code && PG_ERROR_MESSAGES[err.code]) {
    const pgError = PG_ERROR_MESSAGES[err.code];
    statusCode = pgError.status;
    message = `${pgError.message} (${err.message || 'Database constraint error'})`;
    code = pgError.code;
  } else if (err?.code?.startsWith('PGRST')) {
    statusCode = 400;
    message = err?.message ?? 'Database request error';
    code = 'BAD_REQUEST';
  } else if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
    code = 'UNAUTHORIZED';
  }

  if (statusCode === 500 && env.app.nodeEnv === 'production') {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json(errorResponse(message, code, errors));
}
