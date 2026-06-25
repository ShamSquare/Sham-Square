import { CrudController } from './CrudController.ts';
import { categoryService } from '../services/index.ts';
import type { ICategory } from '../database/models/index.ts';

export class CategoryController extends CrudController<ICategory> {
  constructor() {
    super(categoryService);
  }
}

export const categoryController = new CategoryController();
