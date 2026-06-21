import { CrudController } from './CrudController.js';
import { wishlistService } from '../services/index.js';
import type { IWishlist } from '../database/models/index.js';

export class WishlistController extends CrudController<IWishlist> {
  constructor() {
    super(wishlistService);
  }
}

export const wishlistController = new WishlistController();
