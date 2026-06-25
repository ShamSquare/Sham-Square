import { CrudController } from './CrudController.ts';
import { cartService } from '../services/index.ts';
import type { ICart } from '../database/models/index.ts';

export class CartController extends CrudController<ICart> {
  constructor() {
    super(cartService);
  }
}

export const cartController = new CartController();
