import { BaseRepository } from './BaseRepository.ts';
import { Banner, type IBanner } from '../models/index.ts';

export class BannerRepository extends BaseRepository<IBanner> {
  constructor() {
    super(Banner);
  }
}

export const bannerRepository = new BannerRepository();
