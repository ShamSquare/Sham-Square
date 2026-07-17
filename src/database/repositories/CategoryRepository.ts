import { BaseRepository } from './BaseRepository';
import type { ICategory } from '../models/index';

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor() {
    super('categories');
  }
}

export const categoryRepository = new CategoryRepository();
