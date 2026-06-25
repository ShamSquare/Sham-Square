import { CrudController } from './CrudController.ts';
import { productReviewService } from '../services/index.ts';
import type { IProductReview } from '../database/models/index.ts';

export class ProductReviewController extends CrudController<IProductReview> {
  constructor() {
    super(productReviewService);
  }
}

export const productReviewController = new ProductReviewController();
