import { BaseRepository } from './BaseRepository.js';
import { Banner, type IBanner } from '../models/index.js';

export class BannerRepository extends BaseRepository<IBanner> {
  constructor() {
    super(Banner);
  }
}

export const bannerRepository = new BannerRepository();
