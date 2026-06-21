import { BaseService } from './BaseService.js';
import { wishlistRepository } from '../database/repositories/index.js';
import type { IWishlist } from '../database/models/index.js';

export class WishlistService extends BaseService<IWishlist> {
  constructor() {
    super(wishlistRepository);
  }
}

export const wishlistService = new WishlistService();
