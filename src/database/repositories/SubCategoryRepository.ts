import { BaseRepository } from './BaseRepository.ts';
import type { ISubCategory } from '../models/index.ts';

export class SubCategoryRepository extends BaseRepository<ISubCategory> {
  constructor() {
    super('subcategories');
  }
}

export const subCategoryRepository = new SubCategoryRepository();
