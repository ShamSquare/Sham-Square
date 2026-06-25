import { BaseService } from './BaseService.ts';
import { cartRepository } from '../database/repositories/index.ts';
import type { ICart } from '../database/models/index.ts';

export class CartService extends BaseService<ICart> {
  constructor() {
    super(cartRepository);
  }
}

export const cartService = new CartService();
