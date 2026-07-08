import { CrudController } from './CrudController.ts';
import { categoryService } from '../services/index.ts';
import type { ICategory } from '../database/models/index.ts';
import { AppError } from '../utils/app-error.util.ts';

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
}

export const categoryController = new CategoryController();
