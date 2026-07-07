import { BaseRepository } from './BaseRepository.ts';
import type { IUser } from '../models/index.ts';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super('users');
  }
}

export const userRepository = new UserRepository();
