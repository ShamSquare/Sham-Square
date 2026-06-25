import { BaseRepository } from './BaseRepository.ts';
import { SupportTicket, type ISupportTicket } from '../models/index.ts';

export class SupportTicketRepository extends BaseRepository<ISupportTicket> {
  constructor() {
    super(SupportTicket);
  }
}

export const supportTicketRepository = new SupportTicketRepository();
