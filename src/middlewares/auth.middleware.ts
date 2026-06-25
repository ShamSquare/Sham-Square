import { Request, Response, NextFunction } from 'express';
import jwtUtil from '../utils/jwt.util.ts';
import { AppError } from '../utils/app-error.util.ts';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
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

    const decoded = jwtUtil.verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    next(new AppError(error.message || 'Unauthorized', 401, 'UNAUTHORIZED'));
  }
};