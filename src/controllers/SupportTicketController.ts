import { CrudController } from './CrudController.ts';
import { supportTicketService } from '../services/index.ts';
import type { ISupportTicket } from '../database/models/index.ts';

export class SupportTicketController extends CrudController<ISupportTicket> {
  constructor() {
    super(supportTicketService);
  }
}

export const supportTicketController = new SupportTicketController();
