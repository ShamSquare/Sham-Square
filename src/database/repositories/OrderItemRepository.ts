import { BaseRepository } from './BaseRepository.ts';
import type { IOrderItem } from '../models/index.ts';

export class OrderItemRepository extends BaseRepository<IOrderItem> {
  constructor() {
    super('order_items');
  }
}

export const orderItemRepository = new OrderItemRepository();
