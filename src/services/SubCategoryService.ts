import { BaseService } from './BaseService.ts';
import { subCategoryRepository } from '../database/repositories/index.ts';
import type { ISubCategory } from '../database/models/index.ts';

export class SubCategoryService extends BaseService<ISubCategory> {
  constructor() {
    super(subCategoryRepository);
  }
}

export const subCategoryService = new SubCategoryService();
