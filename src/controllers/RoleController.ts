import { CrudController } from './CrudController.ts';
import { roleService } from '../services/index.ts';
import type { IRole } from '../database/models/index.ts';

export class RoleController extends CrudController<IRole> {
  constructor() {
    super(roleService);
  }
}

export const roleController = new RoleController();
