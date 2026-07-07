import { BaseRepository } from './BaseRepository.ts';
import type { IWishlist } from '../models/index.ts';

export class WishlistRepository extends BaseRepository<IWishlist> {
  constructor() {
    super('wishlists');
  }
}

export const wishlistRepository = new WishlistRepository();
