import { BaseRepository } from './BaseRepository.ts';
import { OrderItem, type IOrderItem } from '../models/index.ts';

export class OrderItemRepository extends BaseRepository<IOrderItem> {
  constructor() {
    super(OrderItem);
  }
}

export const orderItemRepository = new OrderItemRepository();
