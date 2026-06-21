import { BaseRepository } from './BaseRepository.js';
import { Order, type IOrder } from '../models/index.js';

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super(Order);
  }
}

export const orderRepository = new OrderRepository();
