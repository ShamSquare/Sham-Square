import { CrudController } from './CrudController.js';
import { productReviewService } from '../services/index.js';
import type { IProductReview } from '../database/models/index.js';

export class ProductReviewController extends CrudController<IProductReview> {
  constructor() {
    super(productReviewService);
  }
}

export const productReviewController = new ProductReviewController();
