import { BaseService } from './BaseService';
import { orderItemRepository } from '../database/repositories/index';
import type { IOrderItem } from '../database/models/index';

export class OrderItemService extends BaseService<IOrderItem> {
  constructor() {
    super(orderItemRepository);
  }
}

export const orderItemService = new OrderItemService();
