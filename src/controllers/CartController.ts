import { CrudController } from './CrudController';
import { cartService, notificationService } from '../services/index';
import type { ICart } from '../database/models/index';
import { cartRepository, cartItemRepository, orderRepository, orderItemRepository } from '../database/repositories/index';
import { OrderStatus, CartStatus } from '../database/enums/index';
import { AppError } from '../utils/app-error.util';
import { realtimeService } from '../services/RealtimeService';
import { BaseController } from './BaseController';

export class CartController extends CrudController<ICart> {
  constructor() {
    super(cartService);
  }

  async convertActive(req: any, res: any) {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const payment = req.body?.payment || { method: 'COD' };
    const shippingAddress = req.body?.shippingAddress;

    const cart = await cartRepository.findOne({ userId, status: 'ACTIVE' as any });
    if (!cart) throw new AppError('Active cart not found', 404);

    const items = await cartItemRepository.find({ cartId: cart.id });
    const activeItems = items.filter((it : any) => !it.isDeleted);
    if (activeItems.length === 0) throw new AppError('Cart is empty', 400);

    const subtotal = activeItems.reduce((s: any, it: any) => s + (it.unitPrice || 0) * (it.quantity || 1), 0);
    const pricing = { subtotal, discount: 0, shipping: 0, tax: 0, total: subtotal, currency: cart.currency || 'USD' };

    const createdOrder = await orderRepository.create({
      orderNumber: `ORD-${Date.now()}`,
      userId: cart.userId!,
      payment,
      shippingAddress: shippingAddress || {},
      pricing,
    });

    for (const it of activeItems) {
      await orderItemRepository.create({
        orderId: createdOrder.id,
        productId: it.productId,
        sku: '',
        productName: it.productName,
        variantName: it.variantName,
        thumbnail: it.thumbnail,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
        currency: it.currency,
      });
    }

    await cartRepository.updateById(cart.id, {
      status: CartStatus.CONVERTED,
      convertedOrderId: createdOrder.id,
    });

    realtimeService.emitToUser(String(userId), 'cart:updated', {
      status: CartStatus.CONVERTED,
      orderId: createdOrder.id,
    });
    realtimeService.emitToUser(String(userId), 'order:created', createdOrder);
    realtimeService.emitToAdmins('order:created', createdOrder);

    try {
      await notificationService.sendOrderStatusNotification(
        userId,
        createdOrder.orderNumber,
        OrderStatus.PENDING,
        createdOrder.id
      );
    } catch (notificationError) {
      // If notification fails, keep order creation intact.
    }

    return this.sendCreated(res, createdOrder);
  }
}

export const cartController = new CartController();
