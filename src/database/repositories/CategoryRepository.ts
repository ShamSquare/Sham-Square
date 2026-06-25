import { BaseRepository } from './BaseRepository.ts';
import { Category, type ICategory } from '../models/index.ts';

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor() {
    super(Category);
  }
}

export const categoryRepository = new CategoryRepository();
