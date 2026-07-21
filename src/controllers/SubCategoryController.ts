import { CrudController } from './CrudController';
import { subCategoryService } from '../services/index';
import type { ISubCategory } from '../database/models/index';
import { AppError } from '../utils/app-error.util';

export class SubCategoryController extends CrudController<ISubCategory> {
  constructor() {
    super(subCategoryService);
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
      const { categoryId, slug, name } = data;

      // Validate required fields
      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: 'categoryId is required',
        });
      }

      // Auto-generate slug if not provided
      let finalSlug = slug;
      if (!finalSlug && name) {
        finalSlug = String(name)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      if (!finalSlug) {
        return res.status(400).json({
          success: false,
          message: 'Slug is required',
        });
      }

      // Check if subcategory with same slug already exists in this category
      const existing = await subCategoryService.findOne({
        categoryId,
        slug: finalSlug,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: `SubCategory with slug "${finalSlug}" already exists in this category`,
          code: 'DUPLICATE_SLUG',
        });
      }

      // Create the subcategory
      const created = await subCategoryService.create({
        ...data,
        slug: finalSlug,
      });

      return this.sendCreated(res, created);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'Failed to create subcategory',
        code: error?.code,
      });
    }
  }

  async update(req: any, res: any) {
    try {
      const data = req.body || {};
      const { categoryId, slug, name } = data;

      // Auto-generate slug if not provided but name is
      let finalSlug = slug;
      if (!finalSlug && name) {
        finalSlug = String(name)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      // If slug or categoryId is being updated, check for duplicates
      if (finalSlug && (categoryId || data.categoryId)) {
        const checkCategoryId = categoryId || data.categoryId;
        const existing = await subCategoryService.findOne({
          categoryId: checkCategoryId,
          slug: finalSlug,
        });

        // If a subcategory with same slug exists in this category and it's not the one we're updating
        if (existing && existing.id !== req.params.id) {
          return res.status(409).json({
            success: false,
            message: `SubCategory with slug "${finalSlug}" already exists in this category`,
            code: 'DUPLICATE_SLUG',
          });
        }
      }

      // Update the subcategory
      const updated = await subCategoryService.updateById(req.params.id, data);
      if (!updated) {
        return this.sendError(res, 'Not found', 404);
      }

      return this.sendSuccess(res, updated);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'Failed to update subcategory',
        code: error?.code,
      });
    }
  }
}

export const subCategoryController = new SubCategoryController();
