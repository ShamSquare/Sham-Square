import { BaseService } from './BaseService';
import { departmentRepository } from '../database/repositories/DepartmentRepository';
import type { IDepartment } from '../database/models/Department';

export class DepartmentService extends BaseService<IDepartment> {
  constructor() {
    super(departmentRepository);
  }

  async create(data: Partial<IDepartment>): Promise<IDepartment> {
    const departmentData: Partial<IDepartment> = {
      ...data,
      productCount: 0,
      orderCount: 0,
      revenue: 0,
      isActive: true,
      adminIds: data.adminIds || [],
    };

    return super.create(departmentData);
  }

  async updateById(id: string, data: Partial<IDepartment>): Promise<IDepartment | null> {
    return super.updateById(id, data);
  }
}

export const departmentService = new DepartmentService();