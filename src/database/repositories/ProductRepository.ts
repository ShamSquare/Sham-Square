import { BaseRepository } from './BaseRepository.js';
import { Product, type IProduct } from '../models/index.js';

export class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super(Product);
  }
}

export const productRepository = new ProductRepository();
