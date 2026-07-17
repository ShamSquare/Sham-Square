import { BaseService } from './BaseService';
import { cartRepository } from '../database/repositories/index';
import type { ICart } from '../database/models/index';

export class CartService extends BaseService<ICart> {
  constructor() {
    super(cartRepository);
  }
}

export const cartService = new CartService();
