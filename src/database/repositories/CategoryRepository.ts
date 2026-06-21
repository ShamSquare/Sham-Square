import { BaseRepository } from './BaseRepository.js';
import { Category, type ICategory } from '../models/index.js';

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor() {
    super(Category);
  }
}

export const categoryRepository = new CategoryRepository();
