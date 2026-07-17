import { CrudController } from './CrudController';
import { productVariantService } from '../services/index';
import type { IProductVariant } from '../database/models/index';

export class ProductVariantController extends CrudController<IProductVariant> {
  constructor() {
    super(productVariantService);
  }
}

export const productVariantController = new ProductVariantController();
