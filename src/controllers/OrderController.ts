import { CrudController } from './CrudController';
import { orderService, notificationService } from '../services/index';
import type { IOrder } from '../database/models/index';
import { OrderStatus } from '../database/enums/index';
import { AppError } from '../utils/app-error.util';
import { realtimeService } from '../services/RealtimeService';

type AuthReq = import('../middlewares/auth.middleware').AuthRequest;

export class OrderController extends CrudController<IOrder> {
  constructor() {
    super(orderService);
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
    const updated = await orderService.updateById(req.params.id, req.body as any);
    if (!updated) throw new AppError('Order not found', 404);

    if ((updated as any).userId) {
      realtimeService.emitToUser(String((updated as any).userId), 'order:updated', updated);
    }
    realtimeService.emitToAdmins('order:updated', updated);
    return res.status(200).json({ success: true, data: updated });
  }
}

export const orderController = new OrderController();
