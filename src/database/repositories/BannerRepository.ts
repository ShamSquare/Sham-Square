import { BaseRepository } from './BaseRepository.ts';
import type { IBanner } from '../models/index.ts';

export class BannerRepository extends BaseRepository<IBanner> {
  constructor() {
    super('banners');
  }
}

export const bannerRepository = new BannerRepository();
