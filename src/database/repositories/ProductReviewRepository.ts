import { BaseRepository } from './BaseRepository.js';
import { ProductReview, type IProductReview } from '../models/index.js';

export class ProductReviewRepository extends BaseRepository<IProductReview> {
  constructor() {
    super(ProductReview);
  }
}

export const productReviewRepository = new ProductReviewRepository();
