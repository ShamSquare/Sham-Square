import { BaseService } from './BaseService';
import { bannerRepository } from '../database/repositories/index';
import type { IBanner } from '../database/models/index';

export class BannerService extends BaseService<IBanner> {
  constructor() {
    super(bannerRepository);
  }
}

export const bannerService = new BannerService();
