import { BaseRepository } from './BaseRepository.ts';
import { ProductReview, type IProductReview } from '../models/index.ts';

export class ProductReviewRepository extends BaseRepository<IProductReview> {
  constructor() {
    super(ProductReview);
  }
}

export const productReviewRepository = new ProductReviewRepository();
