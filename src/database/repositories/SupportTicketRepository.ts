import { BaseRepository } from './BaseRepository.ts';
import type { ISupportTicket } from '../models/index.ts';

export class SupportTicketRepository extends BaseRepository<ISupportTicket> {
  constructor() {
    super('support_tickets');
  }
}

export const supportTicketRepository = new SupportTicketRepository();
