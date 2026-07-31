import { BaseService } from './BaseService';
import { orderRepository } from '../database/repositories/index';
import type { IOrder } from '../database/models/index';
import type { OrderWithUser } from '../database/repositories/OrderRepository';
import { getAdminClient } from '../database/supabase';
import { AppError } from '../utils/app-error.util';

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

  async updateById(id: string, data: Partial<IOrder>): Promise<IOrder | null> {
    const existing = await orderRepository.findById(id);
    if (!existing) return null;

    const updated = await orderRepository.updateById(id, data);
    if (!updated) return null;

    return updated;
  }

  async createAtomic(payload: Record<string, any>): Promise<{ id: string; orderNumber: string; success: boolean }> {
    const client = getAdminClient();
    const { data, error } = await client.rpc('create_order_atomic', { p_payload: payload });

    if (error) {
      const message = typeof error.message === 'string' ? error.message : 'Failed to create order';
      throw new AppError(message, 500, 'ORDER_CREATION_FAILED');
    }

    if (!data || !data.success) {
      throw new AppError('Failed to create order', 500, 'ORDER_CREATION_FAILED');
    }

    return data as { id: string; orderNumber: string; success: boolean };
  }
}

export const orderService = new OrderService();
