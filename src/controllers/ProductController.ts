import { CrudController } from './CrudController.js';
import { productService } from '../services/index.js';
import type { IProduct } from '../database/models/index.js';

export class ProductController extends CrudController<IProduct> {
  constructor() {
    super(productService);
  }
}

export const productController = new ProductController();
