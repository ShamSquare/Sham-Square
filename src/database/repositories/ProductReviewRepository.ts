import { BaseRepository } from './BaseRepository.ts';
import type { IProductReview } from '../models/index.ts';

export class ProductReviewRepository extends BaseRepository<IProductReview> {
  constructor() {
    super('product_reviews');
  }
}

export const productReviewRepository = new ProductReviewRepository();
