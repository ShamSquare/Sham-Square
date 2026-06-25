import { BaseService } from './BaseService.ts';
import { bannerRepository } from '../database/repositories/index.ts';
import type { IBanner } from '../database/models/index.ts';

export class BannerService extends BaseService<IBanner> {
  constructor() {
    super(bannerRepository);
  }
}

export const bannerService = new BannerService();
