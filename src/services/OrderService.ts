import { BaseService } from './BaseService.js';
import { orderRepository } from '../database/repositories/index.js';
import type { IOrder } from '../database/models/index.js';

export class OrderService extends BaseService<IOrder> {
  constructor() {
    super(orderRepository);
  }
}

export const orderService = new OrderService();
