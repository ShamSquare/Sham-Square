import { BaseRepository } from './BaseRepository.js';
import { User, type IUser } from '../models/index.js';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }
}

export const userRepository = new UserRepository();
