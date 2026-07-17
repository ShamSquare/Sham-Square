import { CrudController } from './CrudController';
import { bannerService } from '../services/index';
import type { IBanner } from '../database/models/index';

export class BannerController extends CrudController<IBanner> {
  constructor() {
    super(bannerService);
  }
}

export const bannerController = new BannerController();
