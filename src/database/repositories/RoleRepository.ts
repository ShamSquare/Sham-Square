import { BaseRepository } from './BaseRepository.ts';
import { Role, type IRole } from '../models/index.ts';

export class RoleRepository extends BaseRepository<IRole> {
  constructor() {
    super(Role);
  }
}

export const roleRepository = new RoleRepository();
