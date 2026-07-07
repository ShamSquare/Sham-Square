import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.util.ts';
import logger from '../utils/logger.util.ts';
import { errorResponse } from '../utils/api-response.util.ts';
import env from '../config/env.config.ts';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Request failed', {
    message: err?.message,
    stack: err?.stack,
    method: req.method,
    path: req.originalUrl,
    statusCode: err?.statusCode,
    code: err?.code,
  });

  let statusCode = 500;
  let message = 'Internal Server Error';
  let code: string | undefined = 'INTERNAL_SERVER_ERROR';
  let errors: Record<string, any> | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  } else if (err?.code === '23505') {
    statusCode = 409;
    message = 'A record with this value already exists';
    code = 'CONFLICT';
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
