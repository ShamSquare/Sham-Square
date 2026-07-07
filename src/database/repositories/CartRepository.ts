import { BaseRepository } from './BaseRepository.ts';
import type { ICart } from '../models/index.ts';

export class CartRepository extends BaseRepository<ICart> {
  constructor() {
    super('carts');
  }
}

export const cartRepository = new CartRepository();
