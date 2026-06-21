import { BaseService } from './BaseService.js';
import { categoryRepository } from '../database/repositories/index.js';
import type { ICategory } from '../database/models/index.js';

export class CategoryService extends BaseService<ICategory> {
  constructor() {
    super(categoryRepository);
  }
}

export const categoryService = new CategoryService();
