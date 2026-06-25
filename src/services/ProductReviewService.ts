import { BaseService } from './BaseService.ts';
import { productReviewRepository } from '../database/repositories/index.ts';
import type { IProductReview } from '../database/models/index.ts';

export class ProductReviewService extends BaseService<IProductReview> {
  constructor() {
    super(productReviewRepository);
  }
}

export const productReviewService = new ProductReviewService();
