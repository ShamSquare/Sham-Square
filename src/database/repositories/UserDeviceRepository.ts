import { BaseRepository } from './BaseRepository.ts';
import type { IUserDevice } from '../models/index.ts';

export class UserDeviceRepository extends BaseRepository<IUserDevice> {
  constructor() {
    super('user_devices');
  }
}

export const userDeviceRepository = new UserDeviceRepository();
