import { BaseRepository } from './BaseRepository.ts';
import type { IProductVariant } from '../models/index.ts';

export class ProductVariantRepository extends BaseRepository<IProductVariant> {
  constructor() {
    super('product_variants');
  }
}

export const productVariantRepository = new ProductVariantRepository();
