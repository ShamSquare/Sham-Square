import { CrudController } from './CrudController.js';
import { bannerService } from '../services/index.js';
import type { IBanner } from '../database/models/index.js';

export class BannerController extends CrudController<IBanner> {
  constructor() {
    super(bannerService);
  }
}

export const bannerController = new BannerController();
