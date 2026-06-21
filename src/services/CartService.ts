import { BaseService } from './BaseService.js';
import { cartRepository } from '../database/repositories/index.js';
import type { ICart } from '../database/models/index.js';

export class CartService extends BaseService<ICart> {
  constructor() {
    super(cartRepository);
  }
}

export const cartService = new CartService();
