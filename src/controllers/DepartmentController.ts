import { CrudController } from './CrudController';
import { departmentService } from '../services/DepartmentService';
import type { IDepartment } from '../database/models/Department';
import { AppError } from '../utils/app-error.util';

export class DepartmentController extends CrudController<IDepartment> {
  constructor() {
    super(departmentService);
  }

  async list(req: any, res: any) {
    const { search, page = 1, limit = 10 } = req.query;

    const items = await this.service.find({}, {
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      orderBy: 'createdAt',
      orderDir: 'desc',
    });

    let filteredItems = items;
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredItems = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.nameAr.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredItems.length;

    return this.sendSuccess(res, {
      data: filteredItems,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  }

  async create(req: any, res: any) {
    const { name, nameAr, description, adminIds } = req.body;

    if (!name || !name.trim()) {
      throw new AppError('Department name is required', 400, 'VALIDATION_ERROR');
    }
    if (!nameAr || !nameAr.trim()) {
      throw new AppError('Department Arabic name is required', 400, 'VALIDATION_ERROR');
    }

    const department = await this.service.create({
      name: name.trim(),
      nameAr: nameAr.trim(),
      description,
      adminIds: adminIds || [],
    });

    return this.sendCreated(res, department);
  }

  async getById(req: any, res: any) {
    const item = await this.service.getById(req.params.id);
    if (!item) {
      return this.sendError(res, 'Department not found', 404);
    }
    return this.sendSuccess(res, item);
  }

  async update(req: any, res: any) {
    const { name, nameAr, description, adminIds } = req.body;

    const updateData: Partial<IDepartment> = {};
    if (name !== undefined) updateData.name = name;
    if (nameAr !== undefined) updateData.nameAr = nameAr;
    if (description !== undefined) updateData.description = description;
    if (adminIds !== undefined) updateData.adminIds = adminIds;

    const updated = await this.service.updateById(req.params.id, updateData);

    if (!updated) {
      return this.sendError(res, 'Department not found', 404);
    }

    return this.sendSuccess(res, updated);
  }

  async remove(req: any, res: any) {
    const item = await this.service.getById(req.params.id);
    if (!item) {
      return this.sendError(res, 'Department not found', 404);
    }

    await this.service.deleteById(req.params.id);
    return this.sendNoContent(res);
  }
}

export const departmentController = new DepartmentController();