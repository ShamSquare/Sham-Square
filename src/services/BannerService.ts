import { BaseService } from './BaseService.js';
import { bannerRepository } from '../database/repositories/index.js';
import type { IBanner } from '../database/models/index.js';

export class BannerService extends BaseService<IBanner> {
  constructor() {
    super(bannerRepository);
  }
}

export const bannerService = new BannerService();
