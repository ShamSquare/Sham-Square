import { BaseService } from './BaseService.js';
import { productReviewRepository } from '../database/repositories/index.js';
import type { IProductReview } from '../database/models/index.js';

export class ProductReviewService extends BaseService<IProductReview> {
  constructor() {
    super(productReviewRepository);
  }
}

export const productReviewService = new ProductReviewService();
