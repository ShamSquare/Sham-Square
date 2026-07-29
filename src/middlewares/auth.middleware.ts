import { Request, Response, NextFunction } from 'express';
import jwtUtil, { isTokenBlacklisted } from '../utils/jwt.util';
import { AppError } from '../utils/app-error.util';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
    managedCategory?: string;
  };
}

/**
 * Protect routes (JWT verification)
 */
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'NO_TOKEN');
    }

    const token = authHeader.split(' ')[1];

    if (isTokenBlacklisted(token)) {
      throw new AppError('Token has been invalidated. Please log in again.', 401, 'TOKEN_BLACKLISTED');
    }

    const decoded = jwtUtil.verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      managedCategory: decoded.managedCategory,
    };

    next();
  } catch (error: any) {
    next(new AppError(error.message || 'Unauthorized', 401, 'UNAUTHORIZED'));
  }
};
