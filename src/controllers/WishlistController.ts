import { CrudController } from './CrudController.ts';
import { wishlistService } from '../services/index.ts';
import type { IWishlist } from '../database/models/index.ts';

export class WishlistController extends CrudController<IWishlist> {
  constructor() {
    super(wishlistService);
  }
}

export const wishlistController = new WishlistController();
