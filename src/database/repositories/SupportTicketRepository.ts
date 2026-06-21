import { BaseRepository } from './BaseRepository.js';
import { SupportTicket, type ISupportTicket } from '../models/index.js';

export class SupportTicketRepository extends BaseRepository<ISupportTicket> {
  constructor() {
    super(SupportTicket);
  }
}

export const supportTicketRepository = new SupportTicketRepository();
