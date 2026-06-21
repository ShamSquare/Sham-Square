import { BaseService } from './BaseService.js';
import { productRepository } from '../database/repositories/index.js';
import type { IProduct } from '../database/models/index.js';

export class ProductService extends BaseService<IProduct> {
  constructor() {
    super(productRepository);
  }
}

export const productService = new ProductService();
