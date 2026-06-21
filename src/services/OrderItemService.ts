import { BaseService } from './BaseService.js';
import { orderItemRepository } from '../database/repositories/index.js';
import type { IOrderItem } from '../database/models/index.js';

export class OrderItemService extends BaseService<IOrderItem> {
  constructor() {
    super(orderItemRepository);
  }
}

export const orderItemService = new OrderItemService();
