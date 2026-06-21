import { BaseRepository } from './BaseRepository.js';
import { Wishlist, type IWishlist } from '../models/index.js';

export class WishlistRepository extends BaseRepository<IWishlist> {
  constructor() {
    super(Wishlist);
  }
}

export const wishlistRepository = new WishlistRepository();
