import { BaseRepository } from './BaseRepository';
import type { IProductVariant } from '../models/index';

export class ProductVariantRepository extends BaseRepository<IProductVariant> {
  constructor() {
    super('product_variants');
  }
}

export const productVariantRepository = new ProductVariantRepository();
