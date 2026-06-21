import { CrudController } from './CrudController.js';
import { roleService } from '../services/index.js';
import type { IRole } from '../database/models/index.js';

export class RoleController extends CrudController<IRole> {
  constructor() {
    super(roleService);
  }
}

export const roleController = new RoleController();
