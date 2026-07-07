import { BaseRepository } from './BaseRepository.ts';
import type { IOrder } from '../models/index.ts';

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super('orders');
  }
}

export const orderRepository = new OrderRepository();
