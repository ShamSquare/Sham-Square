import { BaseService } from './BaseService.ts';
import { productRepository } from '../database/repositories/index.ts';
import type { IProduct } from '../database/models/index.ts';

export class ProductService extends BaseService<IProduct> {
  constructor() {
    super(productRepository);
  }
}

export const productService = new ProductService();
