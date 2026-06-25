import { CrudController } from './CrudController.ts';
import { productVariantService } from '../services/index.ts';
import type { IProductVariant } from '../database/models/index.ts';

export class ProductVariantController extends CrudController<IProductVariant> {
  constructor() {
    super(productVariantService);
  }
}

export const productVariantController = new ProductVariantController();
