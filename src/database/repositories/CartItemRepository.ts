import { BaseRepository } from './BaseRepository.js';
import { CartItem, type ICartItem } from '../models/index.js';

export class CartItemRepository extends BaseRepository<ICartItem> {
  constructor() {
    super(CartItem);
  }
}

export const cartItemRepository = new CartItemRepository();
