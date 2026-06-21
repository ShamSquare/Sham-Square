import { CrudController } from './CrudController.js';
import { productVariantService } from '../services/index.js';
import type { IProductVariant } from '../database/models/index.js';

export class ProductVariantController extends CrudController<IProductVariant> {
  constructor() {
    super(productVariantService);
  }
}

export const productVariantController = new ProductVariantController();
