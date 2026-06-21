import { CrudController } from './CrudController.js';
import { cartService } from '../services/index.js';
import type { ICart } from '../database/models/index.js';

export class CartController extends CrudController<ICart> {
  constructor() {
    super(cartService);
  }
}

export const cartController = new CartController();
