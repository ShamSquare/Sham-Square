import { BaseRepository } from './BaseRepository.ts';
import type { IRole } from '../models/index.ts';

export class RoleRepository extends BaseRepository<IRole> {
  constructor() {
    super('roles');
  }
}

export const roleRepository = new RoleRepository();
