import { BaseService } from './BaseService';
import { subCategoryRepository } from '../database/repositories/index';
import type { ISubCategory } from '../database/models/index';

export class SubCategoryService extends BaseService<ISubCategory> {
  constructor() {
    super(subCategoryRepository);
  }
}

export const subCategoryService = new SubCategoryService();
