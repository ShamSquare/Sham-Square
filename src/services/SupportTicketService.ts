import { BaseService } from './BaseService.ts';
import { supportTicketRepository } from '../database/repositories/index.ts';
import type { ISupportTicket } from '../database/models/index.ts';

export class SupportTicketService extends BaseService<ISupportTicket> {
  constructor() {
    super(supportTicketRepository);
  }
}

export const supportTicketService = new SupportTicketService();
