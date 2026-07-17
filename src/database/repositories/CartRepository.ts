import { BaseRepository } from './BaseRepository';
import type { ICart } from '../models/index';

export class CartRepository extends BaseRepository<ICart> {
  constructor() {
    super('carts');
  }
}

export const cartRepository = new CartRepository();
