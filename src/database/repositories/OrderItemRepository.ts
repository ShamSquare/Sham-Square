import { BaseRepository } from './BaseRepository';
import type { IOrderItem } from '../models/index';

export class OrderItemRepository extends BaseRepository<IOrderItem> {
  constructor() {
    super('order_items');
  }
}

export const orderItemRepository = new OrderItemRepository();
