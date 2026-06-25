import { CrudController } from './CrudController.ts';
import { bannerService } from '../services/index.ts';
import type { IBanner } from '../database/models/index.ts';

export class BannerController extends CrudController<IBanner> {
  constructor() {
    super(bannerService);
  }
}

export const bannerController = new BannerController();
