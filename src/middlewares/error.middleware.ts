import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.util.js';
import logger from '../utils/logger.util.js';
import { errorResponse } from '../utils/api-response.util.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(err);

  // default error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = undefined;

  // if it's our custom error
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  }

res.status(statusCode).json(
  errorResponse(message, code)
);
}