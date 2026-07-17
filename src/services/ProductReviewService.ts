import { BaseService } from './BaseService';
import { productReviewRepository } from '../database/repositories/index';
import type { IProductReview } from '../database/models/index';

export class ProductReviewService extends BaseService<IProductReview> {
  constructor() {
    super(productReviewRepository);
  }
}

export const productReviewService = new ProductReviewService();
