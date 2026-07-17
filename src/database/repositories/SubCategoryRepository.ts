import { BaseRepository } from './BaseRepository';
import type { ISubCategory } from '../models/index';

export class SubCategoryRepository extends BaseRepository<ISubCategory> {
  constructor() {
    super('subcategories');
  }
}

export const subCategoryRepository = new SubCategoryRepository();
