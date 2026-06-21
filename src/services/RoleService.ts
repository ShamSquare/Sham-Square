import { BaseService } from './BaseService.js';
import { roleRepository } from '../database/repositories/index.js';
import type { IRole } from '../database/models/index.js';

export class RoleService extends BaseService<IRole> {
  constructor() {
    super(roleRepository);
  }
}

export const roleService = new RoleService();
