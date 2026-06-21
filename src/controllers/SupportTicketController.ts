import { CrudController } from './CrudController.js';
import { supportTicketService } from '../services/index.js';
import type { ISupportTicket } from '../database/models/index.js';

export class SupportTicketController extends CrudController<ISupportTicket> {
  constructor() {
    super(supportTicketService);
  }
}

export const supportTicketController = new SupportTicketController();
