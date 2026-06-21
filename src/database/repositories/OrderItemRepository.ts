import { BaseRepository } from './BaseRepository.js';
import { OrderItem, type IOrderItem } from '../models/index.js';

export class OrderItemRepository extends BaseRepository<IOrderItem> {
  constructor() {
    super(OrderItem);
  }
}

export const orderItemRepository = new OrderItemRepository();
