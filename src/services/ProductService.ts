import { BaseService } from './BaseService';
import { productRepository } from '../database/repositories/index';
import type { IProduct } from '../database/models/index';

export class ProductService extends BaseService<IProduct> {
  constructor() {
    super(productRepository);
  }
}

export const productService = new ProductService();
