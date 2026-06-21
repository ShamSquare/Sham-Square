import { BaseService } from './BaseService.js';
import { subCategoryRepository } from '../database/repositories/index.js';
import type { ISubCategory } from '../database/models/index.js';

export class SubCategoryService extends BaseService<ISubCategory> {
  constructor() {
    super(subCategoryRepository);
  }
}

export const subCategoryService = new SubCategoryService();
