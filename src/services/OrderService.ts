import { BaseService } from './BaseService';
import { orderRepository, orderItemRepository, productRepository } from '../database/repositories/index';
import type { IOrder } from '../database/models/index';
import type { OrderWithUser } from '../database/repositories/OrderRepository';
import { OrderStatus } from '../database/enums/index';
import { getAdminClient } from '../database/supabase';

/** Statuses that represent a completed/successful order */
const COMPLETED_STATUSES: OrderStatus[] = [OrderStatus.DELIVERED];

/** Statuses that represent a cancelled order */
const CANCELLED_STATUSES: OrderStatus[] = [OrderStatus.CANCELLED, OrderStatus.REFUNDED];

export class OrderService extends BaseService<IOrder> {
  constructor() {
    super(orderRepository);
  }

  async getById(id: string): Promise<OrderWithUser | null> {
    return orderRepository.findById(id);
  }

  async find(
    filter?: Partial<IOrder>,
    options?: { limit?: number; offset?: number; orderBy?: string; orderDir?: 'asc' | 'desc' }
  ): Promise<OrderWithUser[]> {
    return orderRepository.find(filter, options);
  }

  /**
   * Override updateById to handle stock and total_sold adjustments
   * when an order transitions to a completed or cancelled status.
   *
   * - When order reaches DELIVERED: decrease product stock, increase total_sold
   * - When order is CANCELLED/REFUNDED: do NOT modify stock or total_sold
   * - Prevents duplicate updates by checking previous status
   */
  async updateById(id: string, data: Partial<IOrder>): Promise<IOrder | null> {
    // Get the current order to check previous status
    const existing = await orderRepository.findById(id);
    if (!existing) return null;

    const previousStatus: OrderStatus = existing.status;
    const newStatus: OrderStatus = (data.status as OrderStatus) || previousStatus;

    // Perform the order update first
    const updated = await orderRepository.updateById(id, data);
    if (!updated) return null;

    // Handle stock / total_sold adjustments based on status transition
    const wasCompleted = COMPLETED_STATUSES.includes(previousStatus);
    const isCompleted = COMPLETED_STATUSES.includes(newStatus);

    // Only adjust stock when transitioning INTO a completed status
    if (!wasCompleted && isCompleted) {
      await this.adjustProductStockForOrder(id);
    }

    // No adjustment needed for cancelled orders (requirement: cancelled orders do not affect stock)

    return updated;
  }

  /**
   * Adjust product stock and total_sold for all items in an order.
   * Uses a Supabase RPC (adjust_stock) to ensure atomic per-product updates.
   *
   * @param orderId  The order ID
   */
  private async adjustProductStockForOrder(orderId: string): Promise<void> {
    const client = getAdminClient();

    const { data: items, error: itemsError } = await client
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('[OrderService] Failed to fetch order items for stock adjustment:', itemsError);
      return;
    }

    if (!items || items.length === 0) return;

    for (const item of items) {
      const productId = item.product_id;
      const quantity = item.quantity;

      if (!productId || !quantity || quantity <= 0) continue;

      const { error: updateError } = await client.rpc('adjust_stock', {
        p_product_id: productId,
        p_quantity: quantity,
      });

      if (updateError) {
        console.error(`[OrderService] Failed to adjust stock for product ${productId}:`, updateError);
      }
    }
  }
}

export const orderService = new OrderService();
