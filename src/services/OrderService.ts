import { BaseService } from './BaseService.ts';
import { orderRepository } from '../database/repositories/index.ts';
import type { IOrder } from '../database/models/index.ts';

export class OrderService extends BaseService<IOrder> {
  constructor() {
    super(orderRepository);
  }
}

export const orderService = new OrderService();
