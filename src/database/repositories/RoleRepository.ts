import { BaseRepository } from './BaseRepository';
import type { IRole } from '../models/index';

export class RoleRepository extends BaseRepository<IRole> {
  constructor() {
    super('roles');
  }
}

export const roleRepository = new RoleRepository();
