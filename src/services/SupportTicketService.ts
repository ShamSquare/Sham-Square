import { BaseService } from './BaseService';
import { supportTicketRepository } from '../database/repositories/index';
import type { ISupportTicket } from '../database/models/index';

export class SupportTicketService extends BaseService<ISupportTicket> {
  constructor() {
    super(supportTicketRepository);
  }
}

export const supportTicketService = new SupportTicketService();
