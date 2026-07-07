import { BaseRepository } from './BaseRepository.ts';
import type { ICartItem } from '../models/index.ts';

export class CartItemRepository extends BaseRepository<ICartItem> {
  constructor() {
    super('cart_items');
  }
}

export const cartItemRepository = new CartItemRepository();
