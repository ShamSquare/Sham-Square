import { CrudController } from './CrudController.ts';
import { productService } from '../services/index.ts';
import type { IProduct } from '../database/models/index.ts';

export class ProductController extends CrudController<IProduct> {
  constructor() {
    super(productService);
  }
}

export const productController = new ProductController();
