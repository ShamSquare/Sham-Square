import { BaseService } from './BaseService';
import { roleRepository } from '../database/repositories/index';
import type { IRole } from '../database/models/index';

export class RoleService extends BaseService<IRole> {
  constructor() {
    super(roleRepository);
  }
}

export const roleService = new RoleService();
