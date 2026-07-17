import { BaseRepository } from './BaseRepository';
import type { ISetting } from '../models/index';

export class SettingRepository extends BaseRepository<ISetting> {
  constructor() {
    super('settings');
  }
}

export const settingRepository = new SettingRepository();
