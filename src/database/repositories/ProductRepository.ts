import { BaseRepository } from './BaseRepository';
import type { IProduct } from '../models/index';

export class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super('products');
  }
}

export const productRepository = new ProductRepository();
