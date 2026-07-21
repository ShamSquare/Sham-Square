import { CrudController } from './CrudController';
import { productService } from '../services/index';
import type { IProduct } from '../database/models/index';
import { realtimeService } from '../services/RealtimeService';
import { sanitizeUUIDFields, isValidUUID } from '../utils/uuid.util';

const UUID_FIELDS = ['categoryId', 'subCategoryId', 'vendorId', 'brandId', 'createdBy', 'updatedBy'];

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

  // Generate slug from name if not provided
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

  // Image (text column in DB)
  if (data.image) {
    transformed.image = String(data.image);
  }

  // isAvailable -> is_available (boolean column in DB)
  if (data.isAvailable !== undefined) {
    transformed.isAvailable = Boolean(data.isAvailable);
  }

  // isFeatured -> is_featured (boolean column in DB)
  if (data.isFeatured !== undefined) {
    transformed.isFeatured = Boolean(data.isFeatured);
  }

  // category (text column in DB - category name)
  if (data.category !== undefined) {
    transformed.category = String(data.category).trim();
  }

  // categoryId -> category_id (uuid column in DB)
  if (data.categoryId !== undefined) transformed.categoryId = data.categoryId;

  // subCategoryId -> sub_category_id (uuid column in DB)
  if (data.subCategoryId !== undefined) transformed.subCategoryId = data.subCategoryId;

  // departmentId -> department_id (uuid column in DB)
  if (data.departmentId !== undefined) transformed.departmentId = data.departmentId;

  return transformed;
}

/**
 * Validate product creation/update data.
 * Returns an array of error messages. Empty array = valid.
 */
function validateProductData(data: Record<string, any>, isUpdate = false): string[] {
  const errors: string[] = [];

  if (!isUpdate) {
    // Required fields for creation
    if (!data.name || !String(data.name).trim()) {
      errors.push('اسم المنتج مطلوب');
    }

    if (!data.categoryId || !isValidUUID(data.categoryId)) {
      errors.push('معرف الفئة (categoryId) مطلوب ويجب أن يكون UUID صالح');
    }

    if (!data.subCategoryId || !isValidUUID(data.subCategoryId)) {
      errors.push('معرف التصنيف الفرعي (subCategoryId) مطلوب ويجب أن يكون UUID صالح');
    }

    if (data.price === undefined || data.price === null || data.price === '' || isNaN(Number(data.price)) || Number(data.price) < 0) {
      errors.push('السعر (price) مطلوب ويجب أن يكون رقماً صالحاً');
    }
  } else {
    // For updates, validate only if provided
    if (data.name !== undefined && !String(data.name).trim()) {
      errors.push('اسم المنتج لا يمكن أن يكون فارغاً');
    }

    if (data.categoryId !== undefined && data.categoryId !== null && !isValidUUID(data.categoryId)) {
      errors.push('معرف الفئة (categoryId) غير صالح');
    }

    if (data.subCategoryId !== undefined && data.subCategoryId !== null && !isValidUUID(data.subCategoryId)) {
      errors.push('معرف التصنيف الفرعي (subCategoryId) غير صالح');
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

  async create(req: any, res: any) {
    try {
      const data = req.body || {};

      // Step 1: Validate raw input first (before transformation)
      const rawErrors = validateProductData(data, false);
      if (rawErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: rawErrors.join('; '),
          errors: rawErrors,
        });
      }

      // Step 2: Transform frontend payload to DB schema
      const transformed = transformProductPayload(data);

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

  async update(req: any, res: any) {
    try {
      // Validate UUID format
      if (!isValidUUID(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      const data = req.body || {};

      // Step 1: Validate raw input first (before transformation)
      const rawErrors = validateProductData(data, true);
      if (rawErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: rawErrors.join('; '),
          errors: rawErrors,
        });
      }

      // Step 2: Transform frontend payload to DB schema
      const transformed = transformProductPayload(data);

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