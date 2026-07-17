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

    if (!name || !nameAr) {
      throw new AppError('Name and Arabic name are required', 400);
    }

    const department = await this.service.create({
      name,
      nameAr,
      description,
      adminIds: adminIds || [],
    });

    return this.sendCreated(res, department);
  }

  async update(req: any, res: any) {
    const { name, nameAr, description, adminIds } = req.body;
    const updated = await this.service.updateById(req.params.id, {
      name,
      nameAr,
      description,
      adminIds,
    });

    if (!updated) {
      return this.sendError(res, 'Not found', 404);
    }

    return this.sendSuccess(res, updated);
  }
}

export const departmentController = new DepartmentController();