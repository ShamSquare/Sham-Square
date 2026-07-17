import { CrudController } from './CrudController';
import { productReviewService } from '../services/index';
import type { IProductReview } from '../database/models/index';

export class ProductReviewController extends CrudController<IProductReview> {
  constructor() {
    super(productReviewService);
  }
}

export const productReviewController = new ProductReviewController();
