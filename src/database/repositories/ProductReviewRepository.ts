import { BaseRepository } from './BaseRepository';
import type { IProductReview } from '../models/index';

export class ProductReviewRepository extends BaseRepository<IProductReview> {
  constructor() {
    super('product_reviews');
  }
}

export const productReviewRepository = new ProductReviewRepository();
