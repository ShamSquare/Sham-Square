import { BaseRepository } from './BaseRepository.ts';
import { Order, type IOrder } from '../models/index.ts';

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super(Order);
  }
}

export const orderRepository = new OrderRepository();
