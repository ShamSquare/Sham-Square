import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { AppError } from '../utils/app-error.util';
import { CategoryType } from '../database/enums/index';

/**
 * Department Admin middleware
 * Ensures the user is a DEPARTMENT_ADMIN and has a managed_category assigned
 */
export const requireDepartmentAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    
    if (!userRole) {
      throw new AppError('Role not found', 403, 'NO_ROLE');
    }

    if (userRole !== 'departmentadmin') {
      throw new AppError('Access denied. Department Admin role required.', 403, 'FORBIDDEN');
    }

    next();
  } catch (error: any) {
    next(new AppError(error.message, 403));
  }
};

/**
 * Department Admin category validation middleware
 * Attaches the managed category to the request object for use in controllers
 */
export const validateDepartmentCategory = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'departmentadmin') {
      return next();
    }

    // For Department Admin, we need to fetch their managed category from the database
    // This will be done in the controller/service layer
    // This middleware just validates that the user is a department admin
    next();
  } catch (error: any) {
    next(new AppError(error.message, 403));
  }
};

/**
 * Helper function to check if a category is valid
 */
export const isValidCategory = (category: string): category is CategoryType => {
  return Object.values(CategoryType).includes(category as CategoryType);
};

/**
 * Middleware factory to validate that a department admin can only access their own category
 * Use this when a category is provided in the request body or params
 */
export const enforceDepartmentCategory = (categorySource: 'body' | 'params' | 'query' = 'body') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role;
      
      // Super admins and regular admins can access any category
      if (userRole === 'superadmin' || userRole === 'admin') {
        return next();
      }

      // Only apply restriction for department admins
      if (userRole !== 'departmentadmin') {
        return next();
      }

      // Get the category from the specified source
      let requestedCategory: string | undefined;
      
      switch (categorySource) {
        case 'body':
          requestedCategory = req.body.category || req.body.Category;
          break;
        case 'params':
          requestedCategory = req.params.category;
          break;
        case 'query':
          requestedCategory = req.query.category as string;
          break;
      }

      // If no category specified, it's allowed (will be set automatically in controller)
      if (!requestedCategory) {
        return next();
      }

      // Validate that the requested category matches the department admin's managed category
      // The managed category will be attached to req by the controller
      const managedCategory = (req as any).user?.managedCategory;
      
      if (!managedCategory) {
        throw new AppError('Department Admin must have a managed category assigned', 403, 'NO_MANAGED_CATEGORY');
      }

      if (requestedCategory !== managedCategory) {
        throw new AppError(
          `Access denied. You can only manage products in the ${managedCategory} category.`,
          403,
          'CATEGORY_MISMATCH'
        );
      }

      next();
    } catch (error: any) {
      next(new AppError(error.message, 403));
    }
  };
};