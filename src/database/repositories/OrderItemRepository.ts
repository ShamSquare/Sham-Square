import { BaseRepository } from './BaseRepository';
import type { IOrderItem } from '../models/index';

export class OrderItemRepository extends BaseRepository<IOrderItem> {
  constructor() {
    super('order_items');
  }

  async create(data: Partial<IOrderItem>): Promise<IOrderItem> {
    return super.create(data);
  }
}

export const orderItemRepository = new OrderItemRepository();
