import { CrudController } from './CrudController';
import { orderService, notificationService } from '../services/index';
import type { IOrder } from '../database/models/index';
import { OrderStatus } from '../database/enums/index';
import { AppError } from '../utils/app-error.util';
import { realtimeService } from '../services/RealtimeService';
import { isValidUUID } from '../utils/uuid.util';

type AuthReq = import('../middlewares/auth.middleware').AuthRequest;

export class OrderController extends CrudController<IOrder> {
  constructor() {
    super(orderService);
  }

  async list(req: AuthReq, res: any) {
    const {
      search,
      status,
      paymentStatus,
      dateFrom,
      dateTo,
      sortBy = 'newest',
      page = '1',
      limit = '50',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit as string, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = {};

    if (search && typeof search === 'string') {
      const term = search.trim().toLowerCase();
      filter.$or = [
        { id: { $ilike: `%${term}%` } },
        { orderNumber: { $ilike: `%${term}%` } },
        { 'shippingAddress.fullName': { $ilike: `%${term}%` } },
        { 'shippingAddress.phone': { $ilike: `%${term}%` } },
        { 'shippingAddress.email': { $ilike: `%${term}%` } },
      ];
    }

    if (status && typeof status === 'string') {
      filter.status = status.toUpperCase();
    }

    if (paymentStatus && typeof paymentStatus === 'string') {
      filter['payment.status'] = paymentStatus.toUpperCase();
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom && typeof dateFrom === 'string') {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo && typeof dateTo === 'string') {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    let orderBy: string | undefined;
    let orderDir: 'asc' | 'desc' = 'desc';

    if (sortBy === 'oldest') {
      orderBy = 'createdAt';
      orderDir = 'asc';
    } else if (sortBy === 'total') {
      orderBy = 'pricing.total';
      orderDir = 'desc';
    } else {
      orderBy = 'createdAt';
      orderDir = 'desc';
    }

    const [items, total] = await Promise.all([
      orderService.find(filter, { limit: limitNum, offset, orderBy, orderDir }),
      orderService.count(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  }

  async create(req: AuthReq, res: any) {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const payload = {
      ...req.body,
      userId,
      orderNumber: req.body.orderNumber || `ORD-${Date.now()}`,
    };

    const created = await orderService.create(payload as any);
    realtimeService.emitToUser(String(userId), 'order:created', created);
    realtimeService.emitToAdmins('order:created', created);

    try {
      await notificationService.sendOrderStatusNotification(
        userId as any,
        created.orderNumber,
        OrderStatus.PENDING,
        created.id
      );
    } catch {
      // keep order creation intact even if notification fails
    }

    return this.sendCreated(res, created);
  }

  async update(req: AuthReq, res: any) {
    // Validate UUID format
    if (!isValidUUID(req.params.id)) {
      return this.sendError(res, 'Invalid order ID', 400);
    }

    const updated = await orderService.updateById(req.params.id, req.body as any);
    if (!updated) {
      return this.sendError(res, 'Order not found', 404);
    }

    if ((updated as any).userId) {
      realtimeService.emitToUser(String((updated as any).userId), 'order:updated', updated);
    }
    realtimeService.emitToAdmins('order:updated', updated);
    return res.status(200).json({ success: true, data: updated });
  }
}

export const orderController = new OrderController();
