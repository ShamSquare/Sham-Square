import { BaseRepository } from './BaseRepository.ts';
import { Wishlist, type IWishlist } from '../models/index.ts';

export class WishlistRepository extends BaseRepository<IWishlist> {
  constructor() {
    super(Wishlist);
  }
}

export const wishlistRepository = new WishlistRepository();
