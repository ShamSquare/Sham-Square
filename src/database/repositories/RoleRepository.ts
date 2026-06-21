import { BaseRepository } from './BaseRepository.js';
import { Role, type IRole } from '../models/index.js';

export class RoleRepository extends BaseRepository<IRole> {
  constructor() {
    super(Role);
  }
}

export const roleRepository = new RoleRepository();
