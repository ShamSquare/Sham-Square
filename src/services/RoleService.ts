import { BaseService } from './BaseService.ts';
import { roleRepository } from '../database/repositories/index.ts';
import type { IRole } from '../database/models/index.ts';

export class RoleService extends BaseService<IRole> {
  constructor() {
    super(roleRepository);
  }
}

export const roleService = new RoleService();
