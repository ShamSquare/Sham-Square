import { BaseRepository } from './BaseRepository';
import type { IDepartment } from '../models/Department';

export class DepartmentRepository extends BaseRepository<IDepartment> {
  constructor() {
    super('departments');
  }
}

export const departmentRepository = new DepartmentRepository();