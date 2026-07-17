import { BaseRepository } from './BaseRepository';
import type { IOrder } from '../models/index';

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super('orders');
  }
}

export const orderRepository = new OrderRepository();
