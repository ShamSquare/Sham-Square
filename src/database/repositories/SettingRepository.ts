import { BaseRepository } from './BaseRepository.ts';
import type { ISetting } from '../models/index.ts';

export class SettingRepository extends BaseRepository<ISetting> {
  constructor() {
    super('settings');
  }
}

export const settingRepository = new SettingRepository();
