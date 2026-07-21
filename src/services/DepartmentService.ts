import { BaseService } from './BaseService';
import { departmentRepository } from '../database/repositories/DepartmentRepository';
import type { IDepartment } from '../database/models/Department';
import { AppError } from '../utils/app-error.util';

export class DepartmentService extends BaseService<IDepartment> {
  constructor() {
    super(departmentRepository);
  }

  async create(data: Partial<IDepartment>): Promise<IDepartment> {
    if (!data.name || !data.name.trim()) {
      throw new AppError('Department name is required', 400, 'VALIDATION_ERROR');
    }
    if (!data.nameAr || !data.nameAr.trim()) {
      throw new AppError('Department Arabic name is required', 400, 'VALIDATION_ERROR');
    }

    const name = data.name.trim();
    const nameAr = data.nameAr.trim();

    // Check for duplicate name
    const existingByName = await this.findOne({ name } as Partial<IDepartment>);
    if (existingByName) {
      throw new AppError('A department with this name already exists', 409, 'CONFLICT');
    }

    // Check for duplicate Arabic name
    const existingByNameAr = await this.findOne({ nameAr } as Partial<IDepartment>);
    if (existingByNameAr) {
      throw new AppError('A department with this Arabic name already exists', 409, 'CONFLICT');
    }

    const departmentData: Partial<IDepartment> = {
      name,
      nameAr,
      description: data.description || '',
      supervisorId: data.supervisorId || null,
      adminIds: data.adminIds || [],
      productCount: 0,
      orderCount: 0,
      revenue: 0,
      isActive: true,
    };

    return super.create(departmentData);
  }

  async updateById(id: string, data: Partial<IDepartment>): Promise<IDepartment | null> {
    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new AppError('Department name cannot be empty', 400, 'VALIDATION_ERROR');
      }
      data.name = data.name.trim();

      // Check for duplicate name (exclude current department)
      const existingByName = await this.findOne({ name: data.name } as Partial<IDepartment>);
      if (existingByName && existingByName.id !== id) {
        throw new AppError('A department with this name already exists', 409, 'CONFLICT');
      }
    }

    if (data.nameAr !== undefined) {
      if (!data.nameAr.trim()) {
        throw new AppError('Department Arabic name cannot be empty', 400, 'VALIDATION_ERROR');
      }
      data.nameAr = data.nameAr.trim();

      // Check for duplicate Arabic name (exclude current department)
      const existingByNameAr = await this.findOne({ nameAr: data.nameAr } as Partial<IDepartment>);
      if (existingByNameAr && existingByNameAr.id !== id) {
        throw new AppError('A department with this Arabic name already exists', 409, 'CONFLICT');
      }
    }

    // Ensure supervisorId is explicitly set to null if empty string
    if (data.supervisorId !== undefined && data.supervisorId === '') {
      data.supervisorId = null;
    }

    return super.updateById(id, data);
  }
}

export const departmentService = new DepartmentService();