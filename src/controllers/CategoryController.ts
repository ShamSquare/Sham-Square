import { CrudController } from './CrudController';
import { categoryService } from '../services/index';
import type { ICategory } from '../database/models/index';
import { AppError } from '../utils/app-error.util';
import { isValidUUID } from '../utils/uuid.util';

export class CategoryController extends CrudController<ICategory> {
  constructor() {
    super(categoryService);
  }

  async list(req: any, res: any) {
    const items = await this.service.find({});
    return this.sendSuccess(res, items);
  }

  async getById(req: any, res: any) {
    const item = await this.service.getById(req.params.id);
    if (!item) {
      return this.sendError(res, 'Not found', 404);
    }
    return this.sendSuccess(res, item);
  }

  async create(req: any, res: any) {
    try {
      const data = req.body || {};

      // Validate required fields
      if (!data.name || !String(data.name).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required',
        });
      }

      // Auto-generate slug if not provided
      let slug = data.slug;
      if (!slug && data.name) {
        slug = String(data.name)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: 'Slug is required',
        });
      }

      // Check if category with same slug already exists
      const existing = await categoryService.findOne({ slug });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Category with slug "${slug}" already exists`,
          code: 'DUPLICATE_SLUG',
        });
      }

      const created = await categoryService.create({ ...data, slug });
      return this.sendCreated(res, created);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'Failed to create category',
        code: error?.code,
      });
    }
  }

  async update(req: any, res: any) {
    try {
      const data = req.body || {};

      // Validate UUID format
      if (!isValidUUID(req.params.id)) {
        return this.sendError(res, 'Invalid category ID', 400);
      }

      // Auto-generate slug if not provided but name is
      let slug = data.slug;
      if (!slug && data.name) {
        slug = String(data.name)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      // If slug is being updated, check for duplicates
      if (slug) {
        const existing = await categoryService.findOne({ slug });
        if (existing && existing.id !== req.params.id) {
          return res.status(409).json({
            success: false,
            message: `Category with slug "${slug}" already exists`,
            code: 'DUPLICATE_SLUG',
          });
        }
      }

      const updated = await categoryService.updateById(req.params.id, data);
      if (!updated) {
        return this.sendError(res, 'Not found', 404);
      }

      return this.sendSuccess(res, updated);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'Failed to update category',
        code: error?.code,
      });
    }
  }
}

export const categoryController = new CategoryController();
