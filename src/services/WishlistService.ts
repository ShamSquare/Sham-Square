import { BaseService } from './BaseService';
import { wishlistRepository } from '../database/repositories/index';
import type { IWishlist } from '../database/models/index';

export class WishlistService extends BaseService<IWishlist> {
  constructor() {
    super(wishlistRepository);
  }
}

export const wishlistService = new WishlistService();
