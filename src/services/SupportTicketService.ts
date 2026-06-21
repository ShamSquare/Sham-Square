import { BaseService } from './BaseService.js';
import { supportTicketRepository } from '../database/repositories/index.js';
import type { ISupportTicket } from '../database/models/index.js';

export class SupportTicketService extends BaseService<ISupportTicket> {
  constructor() {
    super(supportTicketRepository);
  }
}

export const supportTicketService = new SupportTicketService();
