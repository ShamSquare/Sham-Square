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
}

export const subCategoryController = new SubCategoryController();
