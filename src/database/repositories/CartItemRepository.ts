import { BaseRepository } from './BaseRepository.ts';
import { CartItem, type ICartItem } from '../models/index.ts';

export class CartItemRepository extends BaseRepository<ICartItem> {
  constructor() {
    super(CartItem);
  }
}

export const cartItemRepository = new CartItemRepository();
