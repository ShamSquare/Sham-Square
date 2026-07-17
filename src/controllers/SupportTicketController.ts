import { CrudController } from './CrudController';
import { supportTicketService } from '../services/index';
import type { ISupportTicket } from '../database/models/index';

export class SupportTicketController extends CrudController<ISupportTicket> {
  constructor() {
    super(supportTicketService);
  }
}

export const supportTicketController = new SupportTicketController();
