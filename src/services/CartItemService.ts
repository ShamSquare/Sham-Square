import { BaseService } from './BaseService';
import { cartItemRepository } from '../database/repositories/index';
import type { ICartItem } from '../database/models/index';

export class CartItemService extends BaseService<ICartItem> {
  constructor() {
    super(cartItemRepository);
  }
}

export const cartItemService = new CartItemService();
