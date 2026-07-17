import { CrudController } from './CrudController';
import { wishlistService } from '../services/index';
import type { IWishlist } from '../database/models/index';

export class WishlistController extends CrudController<IWishlist> {
  constructor() {
    super(wishlistService);
  }
}

export const wishlistController = new WishlistController();
