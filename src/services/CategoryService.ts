import { BaseService } from './BaseService.ts';
import { categoryRepository } from '../database/repositories/index.ts';
import type { ICategory } from '../database/models/index.ts';

export class CategoryService extends BaseService<ICategory> {
  constructor() {
    super(categoryRepository);
  }
}

export const categoryService = new CategoryService();
