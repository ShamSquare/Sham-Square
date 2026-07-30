import { CrudController } from './CrudController';
import { productService } from '../services/index';
import type { IProduct } from '../database/models/index';
import { realtimeService } from '../services/RealtimeService';
import { sanitizeUUIDFields, isValidUUID } from '../utils/uuid.util';
import { CategoryType, SubCategory } from '../database/enums/index';
import { AppError } from '../utils/app-error.util';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getAdminClient } from '../database/supabase';

const UUID_FIELDS = ['vendorId', 'brandId', 'createdBy', 'updatedBy'];

/**
 * Transform frontend product payload to match the database schema.
 * The frontend sends camelCase fields, the DB expects snake_case columns.
 * Maps frontend field names to actual DB column names.
 */
function transformProductPayload(data: Record<string, any>): Record<string, any> {
  const transformed: Record<string, any> = {};

  // Copy basic fields (camelCase -> snake_case mapping)
  if (data.name !== undefined) transformed.name = String(data.name).trim();
  if (data.description !== undefined) transformed.description = String(data.description).trim();
  if (data.slug) transformed.slug = data.slug;
  if (data.brand !== undefined) transformed.brand = String(data.brand).trim();
  if (data.tags) {
    transformed.tags = Array.isArray(data.tags) ? data.tags : String(data.tags).split(',').map((t: string) => t.trim()).filter(Boolean);
  }
  if (!transformed.slug && data.name) {
    transformed.slug = String(data.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }

  // Price (numeric column in DB)
  if (data.price !== undefined && data.price !== null && data.price !== '') {
    const price = Number(data.price);
    if (!isNaN(price) && price >= 0) {
      transformed.price = price;
    }
  }

  // Stock (integer column in DB)
  if (data.stock !== undefined && data.stock !== null && data.stock !== '') {
    const stock = Number(data.stock);
    if (!isNaN(stock) && stock >= 0) {
      transformed.stock = stock;
    }
  }

  // Images (text array column in DB)
  if (data.images !== undefined) {
    if (Array.isArray(data.images)) {
      transformed.images = data.images.filter((url: any) => typeof url === 'string' && url.trim() !== '');
    } else if (typeof data.images === 'string' && data.images.trim() !== '') {
      transformed.images = [data.images.trim()];
    }
  }

  // Thumbnail (text column in DB)
  if (data.thumbnail !== undefined && data.thumbnail !== null && String(data.thumbnail).trim() !== '') {
    transformed.thumbnail = String(data.thumbnail).trim();
  }

  // Image (text column in DB)
  if (data.image !== undefined && data.image !== null && String(data.image).trim() !== '') {
    transformed.image = String(data.image).trim();
  }

  // Status (product_status enum in DB)
  if (data.status !== undefined) {
    transformed.status = String(data.status).toUpperCase();
  }

  // isFeatured -> is_featured (boolean column in DB)
  if (data.isFeatured !== undefined) {
    transformed.isFeatured = Boolean(data.isFeatured);
  }

  // total_sold (integer column in DB - managed by OrderService, pass through if provided)
  if (data.total_sold !== undefined && data.total_sold !== null && data.total_sold !== '') {
    const totalSold = Number(data.total_sold);
    if (!isNaN(totalSold) && totalSold >= 0) {
      transformed.total_sold = totalSold;
    }
  }

  // has_sizes -> has_sizes (boolean column in DB)
  if (data.hasSizes !== undefined) {
    transformed.has_sizes = Boolean(data.hasSizes);
  }
  if (data.has_sizes !== undefined) {
    transformed.has_sizes = Boolean(data.has_sizes);
  }

  // sizes (text array column in DB)
  if (data.sizes !== undefined) {
    if (Array.isArray(data.sizes)) {
      transformed.sizes = data.sizes.map((s: string) => String(s).trim()).filter(Boolean);
    } else if (typeof data.sizes === 'string' && data.sizes.trim()) {
      transformed.sizes = [String(data.sizes).trim()];
    } else {
      transformed.sizes = [];
    }
  }

  // has_colors -> has_colors (boolean column in DB)
  if (data.hasColors !== undefined) {
    transformed.has_colors = Boolean(data.hasColors);
  }
  if (data.has_colors !== undefined) {
    transformed.has_colors = Boolean(data.has_colors);
  }

  // colors (text array column in DB)
  if (data.colors !== undefined) {
    if (Array.isArray(data.colors)) {
      transformed.colors = data.colors.map((c: string) => String(c).trim()).filter(Boolean);
    } else if (typeof data.colors === 'string' && data.colors.trim()) {
      transformed.colors = [String(data.colors).trim()];
    } else {
      transformed.colors = [];
    }
  }

  // Category (text column in DB - category_type enum value)
  // Accept both "Category" (PascalCase from frontend) and "category" (camelCase)
  const categoryField = data.Category !== undefined ? data.Category : data.category;
  if (categoryField !== undefined) {
    const categoryValue = String(categoryField).trim().toLowerCase();
    if (Object.values(CategoryType).includes(categoryValue as CategoryType)) {
      transformed.category = categoryValue;
    }
  }

  // SubCategory (text column in DB - subcategory enum value)
  // Accept both "SubCategory" (PascalCase from frontend) and "subCategory" (camelCase)
  const subCategoryField = data.SubCategory !== undefined ? data.SubCategory : data.subCategory;
  if (subCategoryField !== undefined && subCategoryField !== null && subCategoryField !== '') {
    const subCategoryValue = String(subCategoryField).trim().toUpperCase();
    if (Object.values(SubCategory).includes(subCategoryValue as SubCategory)) {
      transformed.subCategory = subCategoryValue;
    }
  }

  return transformed;
}

/**
 * Validate product creation/update data.
 * Returns an array of error messages. Empty array = valid.
 */
function validateProductData(data: Record<string, any>, isUpdate = false): string[] {
  const errors: string[] = [];

  // Normalize field names: accept both PascalCase (Category/SubCategory) and camelCase (category/subCategory)
  const categoryField = data.Category !== undefined ? data.Category : data.category;
  const subCategoryField = data.SubCategory !== undefined ? data.SubCategory : data.subCategory;

  if (!isUpdate) {
    // Required fields for creation
    if (!data.name || !String(data.name).trim()) {
      errors.push('اسم المنتج مطلوب');
    }

    // Validate category is provided and is a valid enum value
    if (!categoryField || !Object.values(CategoryType).includes(String(categoryField).trim().toLowerCase() as CategoryType)) {
      errors.push('الفئة (Category) مطلوبة ويجب أن تكون قيمة صالحة');
    }

    // Validate subCategory business rules
    if (subCategoryField !== undefined && subCategoryField !== null && subCategoryField !== '') {
      const catValue = categoryField ? String(categoryField).trim().toLowerCase() : null;
      const subValue = String(subCategoryField).trim().toUpperCase();
      if (catValue !== CategoryType.LIBRARY_AL_DOHA && subValue !== SubCategory.NO_SUB) {
        errors.push('التصنيف الفرعي (SubCategory) مسموح به فقط لفئة "Library Al Doha"');
      } else if (!Object.values(SubCategory).includes(subValue as SubCategory)) {
        errors.push('قيمة التصنيف الفرعي (SubCategory) غير صالحة');
      }
    }

    if (data.price === undefined || data.price === null || data.price === '' || isNaN(Number(data.price)) || Number(data.price) < 0) {
      errors.push('السعر (price) مطلوب ويجب أن يكون رقماً صالحاً');
    }
  } else {
    // For updates, validate only if provided
    if (data.name !== undefined && !String(data.name).trim()) {
      errors.push('اسم المنتج لا يمكن أن يكون فارغاً');
    }

    // Validate category if provided
    if (categoryField !== undefined && categoryField !== null && categoryField !== '') {
      if (!Object.values(CategoryType).includes(String(categoryField).trim().toLowerCase() as CategoryType)) {
        errors.push('قيمة الفئة (Category) غير صالحة');
      }
    }

    // Validate subCategory if provided
    if (subCategoryField !== undefined && subCategoryField !== null && subCategoryField !== '') {
      const catValue = categoryField ? String(categoryField).trim().toLowerCase() : null;
      const subValue = String(subCategoryField).trim().toUpperCase();
      if (catValue !== CategoryType.LIBRARY_AL_DOHA && subValue !== SubCategory.NO_SUB) {
        errors.push('التصنيف الفرعي (SubCategory) مسموح به فقط لفئة "Library Al Doha"');
      } else if (!Object.values(SubCategory).includes(subValue as SubCategory)) {
        errors.push('قيمة التصنيف الفرعي (SubCategory) غير صالحة');
      }
    }

    if (data.price !== undefined && data.price !== null && data.price !== '' && (isNaN(Number(data.price)) || Number(data.price) < 0)) {
      errors.push('السعر (price) يجب أن يكون رقماً صالحاً');
    }
  }

  return errors;
}

export class ProductController extends CrudController<IProduct> {
  constructor() {
    super(productService);
  }

  /**
   * Override list to enforce DEPARTMENT_ADMIN category filtering on the backend.
   * SUPER_ADMIN and ADMIN see all products.
   * DEPARTMENT_ADMIN sees only products in their managed category.
   */
  async list(req: AuthRequest, res: any) {
    try {
      const userRole = req.user?.role;
      const { search, category, status, page = '1', limit = '50', sortBy = 'newest' } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(200, Math.max(1, parseInt(limit as string, 10) || 50));
      const offset = (pageNum - 1) * limitNum;

      const client = getAdminClient();
      let query = client.from('products').select('*', { count: 'exact' }).eq('is_deleted', false as any);

      // Department Admin: filter by managed category
      if (userRole === 'departmentadmin') {
        const managedCategory = req.user?.managedCategory;
        if (!managedCategory) {
          return res.status(403).json({
            success: false,
            message: 'Department Admin must have a managed category assigned',
            code: 'NO_MANAGED_CATEGORY',
          });
        }
        query = query.eq('category', managedCategory);
      } else if (category && typeof category === 'string') {
        query = query.eq('category', category);
      }

      // Status filter
      if (status && typeof status === 'string') {
        query = query.eq('status', status.toUpperCase());
      }

      // Search filter: use ILIKE on name
      if (search && typeof search === 'string') {
        query = query.ilike('name', `%${search}%`);
      }

      // Sorting
      if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Pagination
      query = query.range(offset, offset + limitNum - 1);

      const { data: items, error, count } = await query;

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: items || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum),
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error?.message || 'Failed to fetch products',
      });
    }
  }

  /**
   * Override getById to enforce DEPARTMENT_ADMIN category restriction.
   * Department Admin can only view products in their managed category.
   */
  async getById(req: AuthRequest, res: any) {
    try {
      if (!isValidUUID(req.params.id)) {
        return this.sendError(res, 'Invalid product ID', 400);
      }

      const item = await productService.getById(req.params.id);
      if (!item) {
        return this.sendError(res, 'Not found', 404);
      }

      // Enforce DEPARTMENT_ADMIN category restriction
      const userRole = req.user?.role;
      if (userRole === 'departmentadmin') {
        const managedCategory = req.user?.managedCategory;
        if (!managedCategory) {
          return this.sendError(res, 'Department Admin must have a managed category assigned', 403);
        }
        if ((item as any).category !== managedCategory) {
          return this.sendError(res, 'Access denied. You can only view products in your category.', 403);
        }
      }

      return this.sendSuccess(res, item);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error?.message || 'Failed to fetch product',
      });
    }
  }

  async create(req: AuthRequest, res: any) {
    try {
      const data = req.body || {};
      const rawErrors = validateProductData(data, false);
      if (rawErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: rawErrors.join('; '),
          errors: rawErrors,
        });
      }

      // Step 2: Transform frontend payload to DB schema
      let transformed = transformProductPayload(data);

      // Step 2.5: Enforce Department Admin category restriction
      const userRole = req.user?.role;
      if (userRole === 'departmentadmin') {
        // Department Admin must have a managed category
        const managedCategory = (req as any).user?.managedCategory;
        console.log('[PRODUCT CREATE DEBUG] DEPARTMENT_ADMIN check:', {
          userId: req.user?.userId,
          role: userRole,
          jwtManagedCategory: managedCategory,
        });
        if (!managedCategory) {
          console.log('[PRODUCT CREATE DEBUG] NO_MANAGED_CATEGORY - throwing error');
          throw new AppError('Department Admin must have a managed category assigned', 403, 'NO_MANAGED_CATEGORY');
        }

        // Force the category to be the managed category
        transformed.category = managedCategory;
      }

      // Step 3: Sanitize UUID fields (convert empty strings to null)
      const sanitized = sanitizeUUIDFields(transformed, UUID_FIELDS);

      // Step 4: Create the product
      const created = await productService.create(sanitized);
      realtimeService.emitPublic('inventory:updated', { action: 'created', product: created });
      return this.sendCreated(res, created);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'فشل إنشاء المنتج',
        code: error?.code,
      });
    }
  }

  async update(req: AuthRequest, res: any) {
    try {
      // Validate UUID format
      if (!isValidUUID(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      const data = req.body || {};
      const rawErrors = validateProductData(data, true);
      if (rawErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: rawErrors.join('; '),
          errors: rawErrors,
        });
      }

      // Step 2: Transform frontend payload to DB schema
      let transformed = transformProductPayload(data);

      // Step 2.5: Enforce Department Admin category restriction
      const userRole = req.user?.role;
      if (userRole === 'departmentadmin') {
        // Department Admin cannot change the category
        const managedCategory = (req as any).user?.managedCategory;
        console.log('[PRODUCT UPDATE DEBUG] DEPARTMENT_ADMIN check:', {
          userId: req.user?.userId,
          role: userRole,
          jwtManagedCategory: managedCategory,
        });
        if (transformed.category) {
          if (transformed.category !== managedCategory) {
            console.log('[PRODUCT UPDATE DEBUG] CATEGORY_MISMATCH:', {
              transformedCategory: transformed.category,
              managedCategory,
            });
            throw new AppError(
              `Access denied. You can only manage products in the ${managedCategory} category.`,
              403,
              'CATEGORY_MISMATCH'
            );
          }
        }
      }

      // Step 3: Sanitize UUID fields
      const sanitized = sanitizeUUIDFields(transformed, UUID_FIELDS);

      // Step 4: Update the product
      const updated = await productService.updateById(req.params.id, sanitized);
      if (!updated) return this.sendError(res, 'Not found', 404);

      realtimeService.emitPublic('inventory:updated', { action: 'updated', product: updated });
      return this.sendSuccess(res, updated);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'فشل تحديث المنتج',
        code: error?.code,
      });
    }
  }
}

export const productController = new ProductController();