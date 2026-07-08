import { BaseRepository } from './BaseRepository.ts';
import type { IWebUser } from '../models/WebUser.ts';

export class WebUserRepository extends BaseRepository<IWebUser> {
  constructor() {
    super('web_users');
  }
}

export const webUserRepository = new WebUserRepository();
