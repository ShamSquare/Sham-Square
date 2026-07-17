import { BaseRepository } from './BaseRepository';
import type { ISupportTicket } from '../models/index';

export class SupportTicketRepository extends BaseRepository<ISupportTicket> {
  constructor() {
    super('support_tickets');
  }
}

export const supportTicketRepository = new SupportTicketRepository();
