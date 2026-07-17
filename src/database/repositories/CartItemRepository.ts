import { BaseRepository } from './BaseRepository';
import type { ICartItem } from '../models/index';

export class CartItemRepository extends BaseRepository<ICartItem> {
  constructor() {
    super('cart_items');
  }
}

export const cartItemRepository = new CartItemRepository();
