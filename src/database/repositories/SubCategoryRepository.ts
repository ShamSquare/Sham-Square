import { BaseRepository } from './BaseRepository.ts';
import { SubCategory, type ISubCategory } from '../models/index.ts';

export class SubCategoryRepository extends BaseRepository<ISubCategory> {
  constructor() {
    super(SubCategory);
  }
}

export const subCategoryRepository = new SubCategoryRepository();
