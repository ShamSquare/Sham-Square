import { BaseRepository } from './BaseRepository.js';
import { Cart, type ICart } from '../models/index.js';

export class CartRepository extends BaseRepository<ICart> {
  constructor() {
    super(Cart);
  }
}

export const cartRepository = new CartRepository();
