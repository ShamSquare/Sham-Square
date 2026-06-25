import { BaseService } from './BaseService.ts';
import { wishlistRepository } from '../database/repositories/index.ts';
import type { IWishlist } from '../database/models/index.ts';

export class WishlistService extends BaseService<IWishlist> {
  constructor() {
    super(wishlistRepository);
  }
}

export const wishlistService = new WishlistService();
