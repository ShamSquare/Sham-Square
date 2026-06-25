import { BaseService } from './BaseService.ts';
import { cartItemRepository } from '../database/repositories/index.ts';
import type { ICartItem } from '../database/models/index.ts';

export class CartItemService extends BaseService<ICartItem> {
  constructor() {
    super(cartItemRepository);
  }
}

export const cartItemService = new CartItemService();
