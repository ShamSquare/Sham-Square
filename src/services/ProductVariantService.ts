import { BaseService } from './BaseService.ts';
import { productVariantRepository } from '../database/repositories/index.ts';
import type { IProductVariant } from '../database/models/index.ts';

export class ProductVariantService extends BaseService<IProductVariant> {
  constructor() {
    super(productVariantRepository);
  }
}

export const productVariantService = new ProductVariantService();
