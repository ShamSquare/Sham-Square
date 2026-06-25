import { BaseService } from './BaseService.ts';
import { orderItemRepository } from '../database/repositories/index.ts';
import type { IOrderItem } from '../database/models/index.ts';

export class OrderItemService extends BaseService<IOrderItem> {
  constructor() {
    super(orderItemRepository);
  }
}

export const orderItemService = new OrderItemService();
