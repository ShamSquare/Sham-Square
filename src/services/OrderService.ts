import { BaseService } from './BaseService';
import { orderRepository } from '../database/repositories/index';
import type { IOrder } from '../database/models/index';

export class OrderService extends BaseService<IOrder> {
  constructor() {
    super(orderRepository);
  }
}

export const orderService = new OrderService();
