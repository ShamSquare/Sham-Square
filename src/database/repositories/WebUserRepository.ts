import { BaseRepository } from './BaseRepository';
import type { IWebUser } from '../models/WebUser';

export class WebUserRepository extends BaseRepository<IWebUser> {
  constructor() {
    super('web_users');
  }
}

export const webUserRepository = new WebUserRepository();
