import { BaseRepository } from './BaseRepository';
import type { IUser } from '../models/index';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super('users');
  }
}

export const userRepository = new UserRepository();
