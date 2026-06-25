import { BaseRepository } from './BaseRepository.ts';
import { Product, type IProduct } from '../models/index.ts';

export class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super(Product);
  }
}

export const productRepository = new ProductRepository();
