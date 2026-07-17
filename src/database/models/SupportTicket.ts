import { SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from '../enums/index';

export interface ISupportTicketMessage {
  senderId: string;
  senderRole: string;
  message: string;
  attachments: string[];
  isInternal: boolean;
  createdAt: Date;
}

export interface ISupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  orderId?: string | null;
  category: SupportTicketCategory;
  subject: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assignedTo?: string | null;
  messages: ISupportTicketMessage[];
  messageCount: number;
  lastMessageAt?: Date | null;
  resolvedAt?: Date | null;
  closedAt?: Date | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
