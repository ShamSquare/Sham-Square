import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { AppError } from '../utils/app-error.util.js';

/**
 * Role-based access control
 */
export const authorize =
  (...allowedRoles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        throw new AppError('Role not found', 403, 'NO_ROLE');
      }

      if (!allowedRoles.includes(userRole)) {
        throw new AppError('Forbidden', 403, 'FORBIDDEN');
      }

      next();
    } catch (error: any) {
      next(new AppError(error.message, 403));
    }
  };