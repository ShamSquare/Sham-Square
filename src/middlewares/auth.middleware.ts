import { Request, Response, NextFunction } from 'express';
import jwtUtil, { isTokenBlacklisted } from '../utils/jwt.util';
import { AppError } from '../utils/app-error.util';
import { webAuthService } from '../services/WebAuthService';
import { RoleName } from '../database/enums/index';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
    managedCategory?: string;
    categoryType?: string;
  };
}

/**
 * Protect routes (JWT verification)
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    let managedCategory = decoded.managedCategory;
    let dbCategoryType: string | undefined;

    // Reload managedCategory from database for DEPARTMENT_ADMIN to ensure
    // the latest assignment is used even if the JWT is stale or missing it.
    if (decoded.role === 'departmentadmin') {
      const dbUser = await webAuthService.getUserById(decoded.userId);
      if (dbUser && dbUser.role === RoleName.DEPARTMENT_ADMIN) {
        dbCategoryType = dbUser.categoryType || undefined;
        managedCategory = dbUser.managedCategory || dbCategoryType || managedCategory;
      }
    }

    // For delivery users, ensure they have the correct role in the database
    if (decoded.role === 'delivery') {
      const dbUser = await webAuthService.getUserById(decoded.userId);
      if (!dbUser || dbUser.role !== RoleName.DELIVERY) {
        throw new AppError('Invalid delivery user', 403, 'INVALID_ROLE');
      }
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      managedCategory,
      ...(dbCategoryType && { categoryType: dbCategoryType }),
    };

    next();
  } catch (error: any) {
    next(new AppError(error.message || 'Unauthorized', 401, 'UNAUTHORIZED'));
  }
};
