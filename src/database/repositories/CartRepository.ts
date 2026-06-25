import { BaseRepository } from './BaseRepository.ts';
import { Cart, type ICart } from '../models/index.ts';

export class CartRepository extends BaseRepository<ICart> {
  constructor() {
    super(Cart);
  }
}

export const cartRepository = new CartRepository();
