import { BaseRepository } from './BaseRepository.ts';
import { User, type IUser } from '../models/index.ts';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }
}

export const userRepository = new UserRepository();
