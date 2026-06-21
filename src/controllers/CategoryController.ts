import { CrudController } from './CrudController.js';
import { categoryService } from '../services/index.js';
import type { ICategory } from '../database/models/index.js';

export class CategoryController extends CrudController<ICategory> {
  constructor() {
    super(categoryService);
  }
}

export const categoryController = new CategoryController();
