import { BaseRepository } from './BaseRepository';
import type { IWishlist } from '../models/index';

export class WishlistRepository extends BaseRepository<IWishlist> {
  constructor() {
    super('wishlists');
  }
}

export const wishlistRepository = new WishlistRepository();
