import { BaseService } from './BaseService.js';
import { cartItemRepository } from '../database/repositories/index.js';
import type { ICartItem } from '../database/models/index.js';

export class CartItemService extends BaseService<ICartItem> {
  constructor() {
    super(cartItemRepository);
  }
}

export const cartItemService = new CartItemService();
