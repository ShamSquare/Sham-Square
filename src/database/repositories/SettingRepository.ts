import { BaseRepository } from './BaseRepository.js';
import { Setting, type ISetting } from '../models/index.js';

export class SettingRepository extends BaseRepository<ISetting> {
  constructor() {
    super(Setting);
  }
}

export const settingRepository = new SettingRepository();
