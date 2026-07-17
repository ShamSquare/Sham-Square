import { BaseService } from './BaseService';
import { categoryRepository } from '../database/repositories/index';
import type { ICategory } from '../database/models/index'
;

export class CategoryService extends BaseService<ICategory> {
  constructor() {
    super(categoryRepository);
  }
}

export const categoryService = new CategoryService();
