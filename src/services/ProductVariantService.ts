import { BaseService } from './BaseService';
import { productVariantRepository } from '../database/repositories/index';
import type { IProductVariant } from '../database/models/index';

export class ProductVariantService extends BaseService<IProductVariant> {
  constructor() {
    super(productVariantRepository);
  }
}

export const productVariantService = new ProductVariantService();
