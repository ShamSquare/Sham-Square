import { CrudController } from './CrudController.js';
import { cartItemService } from '../services/index.js';
import type { ICartItem } from '../database/models/index.js';

export class CartItemController extends CrudController<ICartItem> {
  constructor() {
    super(cartItemService);
  }
}

export const cartItemController = new CartItemController();
