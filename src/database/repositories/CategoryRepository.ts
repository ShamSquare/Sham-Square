import { BaseRepository } from './BaseRepository.ts';
import type { ICategory } from '../models/index.ts';

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor() {
    super('categories');
  }
}

export const categoryRepository = new CategoryRepository();
