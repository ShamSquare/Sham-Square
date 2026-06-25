import { BaseRepository } from './BaseRepository.ts';
import { Setting, type ISetting } from '../models/index.ts';

export class SettingRepository extends BaseRepository<ISetting> {
  constructor() {
    super(Setting);
  }
}

export const settingRepository = new SettingRepository();
