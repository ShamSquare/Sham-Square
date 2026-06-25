import { BaseRepository } from './BaseRepository.ts';
import { ProductVariant, type IProductVariant } from '../models/index.ts';

export class ProductVariantRepository extends BaseRepository<IProductVariant> {
  constructor() {
    super(ProductVariant);
  }
}

export const productVariantRepository = new ProductVariantRepository();
