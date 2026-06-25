import { CrudController } from './CrudController.ts';
import { cartItemService } from '../services/index.ts';
import type { ICartItem } from '../database/models/index.ts';

export class CartItemController extends CrudController<ICartItem> {
  constructor() {
    super(cartItemService);
  }
}

export const cartItemController = new CartItemController();
