import { BaseService } from './BaseService';
import { orderRepository } from '../database/repositories/index';
import type { IOrder } from '../database/models/index';
import type { OrderWithUser } from '../database/repositories/OrderRepository';

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
}

export const orderService = new OrderService();
