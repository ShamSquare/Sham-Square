import { CrudController } from './CrudController';
import { productService } from '../services/index';
import type { IProduct } from '../database/models/index';
import { realtimeService } from '../services/RealtimeService';
import { sanitizeUUIDFields, isValidUUID } from '../utils/uuid.util';
import { Category, SubCategory } from '../database/enums/index';

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

  // Category (text column in DB - category enum value)
  // Accept both "Category" (PascalCase from frontend) and "category" (camelCase)
  const categoryField = data.Category !== undefined ? data.Category : data.category;
  if (categoryField !== undefined) {
    const categoryValue = String(categoryField).trim().toUpperCase();
    if (Object.values(Category).includes(categoryValue as Category)) {
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

  // Normalize field names: accept both PascalCase (Category/SubCategory) and camelCase (category/subCategory)
  const categoryField = data.Category !== undefined ? data.Category : data.category;
  const subCategoryField = data.SubCategory !== undefined ? data.SubCategory : data.subCategory;

  if (!isUpdate) {
    // Required fields for creation
    if (!data.name || !String(data.name).trim()) {
      errors.push('اسم المنتج مطلوب');
    }

    // Validate category is provided and is a valid enum value
    if (!categoryField || !Object.values(Category).includes(String(categoryField).trim().toUpperCase() as Category)) {
      errors.push('الفئة (Category) مطلوبة ويجب أن تكون قيمة صالحة');
    }

    // Validate subCategory business rules
    if (subCategoryField !== undefined && subCategoryField !== null && subCategoryField !== '') {
      const catValue = categoryField ? String(categoryField).trim().toUpperCase() : null;
      const subValue = String(subCategoryField).trim().toUpperCase();
      if (catValue !== Category.AL_DUHA_LIBRARY && subValue !== SubCategory.NO_SUB) {
        errors.push('التصنيف الفرعي (SubCategory) مسموح به فقط لفئة "Al-Duha Library"');
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
      if (!Object.values(Category).includes(String(categoryField).trim().toUpperCase() as Category)) {
        errors.push('قيمة الفئة (Category) غير صالحة');
      }
    }

    // Validate subCategory if provided
    if (subCategoryField !== undefined && subCategoryField !== null && subCategoryField !== '') {
      const catValue = categoryField ? String(categoryField).trim().toUpperCase() : null;
      const subValue = String(subCategoryField).trim().toUpperCase();
      if (catValue !== Category.AL_DUHA_LIBRARY && subValue !== SubCategory.NO_SUB) {
        errors.push('التصنيف الفرعي (SubCategory) مسموح به فقط لفئة "Al-Duha Library"');
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

  async create(req: any, res: any) {
    try {
      const data = req.body || {};
      console.log('Incoming Product Create', data);

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
      console.log('Transformed Product Payload', transformed);

      // Step 3: Sanitize UUID fields (convert empty strings to null)
      const sanitized = sanitizeUUIDFields(transformed, UUID_FIELDS);
      console.log('Sanitized Product Payload', sanitized);

      // Step 4: Create the product
      const created = await productService.create(sanitized);
      console.log('Inserted Product', created);
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
      console.log('Incoming Product Update', { id: req.params.id, data });

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
      console.log('Transformed Product Update Payload', transformed);

      // Step 3: Sanitize UUID fields
      const sanitized = sanitizeUUIDFields(transformed, UUID_FIELDS);
      console.log('Sanitized Product Update Payload', sanitized);

      // Step 4: Update the product
      const updated = await productService.updateById(req.params.id, sanitized);
      if (!updated) return this.sendError(res, 'Not found', 404);
      console.log('Updated Product', updated);

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