import { BaseRepository } from './BaseRepository.ts';
import type { IProduct } from '../models/index.ts';

export class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super('products');
  }
}

export const productRepository = new ProductRepository();
