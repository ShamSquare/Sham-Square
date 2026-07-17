import { BaseRepository } from './BaseRepository';
import type { IBanner } from '../models/index';

export class BannerRepository extends BaseRepository<IBanner> {
  constructor() {
    super('banners');
  }
}

export const bannerRepository = new BannerRepository();
