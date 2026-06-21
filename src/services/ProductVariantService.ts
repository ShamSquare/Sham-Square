import { BaseService } from './BaseService.js';
import { productVariantRepository } from '../database/repositories/index.js';
import type { IProductVariant } from '../database/models/index.js';

export class ProductVariantService extends BaseService<IProductVariant> {
  constructor() {
    super(productVariantRepository);
  }
}

export const productVariantService = new ProductVariantService();
