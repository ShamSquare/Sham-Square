import { CrudController } from './CrudController.js';
import { subCategoryService } from '../services/index.js';
import type { ISubCategory } from '../database/models/index.js';

export class SubCategoryController extends CrudController<ISubCategory> {
  constructor() {
    super(subCategoryService);
  }
}

export const subCategoryController = new SubCategoryController();
