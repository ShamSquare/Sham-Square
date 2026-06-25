import { CrudController } from './CrudController.ts';
import { subCategoryService } from '../services/index.ts';
import type { ISubCategory } from '../database/models/index.ts';

export class SubCategoryController extends CrudController<ISubCategory> {
  constructor() {
    super(subCategoryService);
  }
}

export const subCategoryController = new SubCategoryController();
