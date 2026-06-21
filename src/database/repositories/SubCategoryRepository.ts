import { BaseRepository } from './BaseRepository.js';
import { SubCategory, type ISubCategory } from '../models/index.js';

export class SubCategoryRepository extends BaseRepository<ISubCategory> {
  constructor() {
    super(SubCategory);
  }
}

export const subCategoryRepository = new SubCategoryRepository();
