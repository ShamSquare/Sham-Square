import { BaseRepository } from './BaseRepository.js';
import { ProductVariant, type IProductVariant } from '../models/index.js';

export class ProductVariantRepository extends BaseRepository<IProductVariant> {
  constructor() {
    super(ProductVariant);
  }
}

export const productVariantRepository = new ProductVariantRepository();
