import { Schema, model, type Document, type Types } from 'mongoose';
import {
  SUPPORT_TICKET_CATEGORY_VALUES,
  SUPPORT_TICKET_PRIORITY_VALUES,
  SUPPORT_TICKET_STATUS_VALUES,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from '../enums/index.js';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.js';

export interface ISupportTicketMessage {
  _id?: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole: string;
  message: string;
  attachments: string[];
  isInternal: boolean;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  ticketNumber: string;
  userId: Types.ObjectId;
  orderId?: Types.ObjectId | null;
  category: SupportTicketCategory;
  subject: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assignedTo?: Types.ObjectId | null;
  messages: ISupportTicketMessage[];
  messageCount: number;
  lastMessageAt?: Date | null;
  resolvedAt?: Date | null;
  closedAt?: Date | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const ticketMessageSchema = new Schema<ISupportTicketMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    attachments: {
      type: [String],
      default: [],
      validate: {
        validator(v: string[]) {
          return v.length <= 10;
        },
        message: 'Maximum 10 attachments per message',
      },
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 32,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true,
    },
    category: {
      type: String,
      enum: SUPPORT_TICKET_CATEGORY_VALUES,
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    priority: {
      type: String,
      enum: SUPPORT_TICKET_PRIORITY_VALUES,
      default: SupportTicketPriority.MEDIUM,
      index: true,
    },
    status: {
      type: String,
      enum: SUPPORT_TICKET_STATUS_VALUES,
      default: SupportTicketStatus.OPEN,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    messages: {
      type: [ticketMessageSchema],
      default: [],
      validate: {
        validator(v: ISupportTicketMessage[]) {
          return v.length <= 200;
        },
        message: 'Ticket message limit reached — migrate to ticketMessages collection',
      },
    },
    messageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  {
    collection: 'supportTickets',
    timestamps: true,
  }
);

supportTicketSchema.plugin(auditFieldsPlugin);
supportTicketSchema.plugin(softDeletePlugin);

supportTicketSchema.pre('save', function syncMessageMeta(this: ISupportTicket, next) {
  this.messageCount = this.messages.length;
  if (this.messages.length > 0) {
    const last = this.messages[this.messages.length - 1];
    this.lastMessageAt = last.createdAt;
  }
  next();
});

supportTicketSchema.index({ ticketNumber: 1 }, { unique: true });
supportTicketSchema.index({ userId: 1, status: 1, createdAt: -1 });
supportTicketSchema.index({ assignedTo: 1, status: 1, priority: 1 });
supportTicketSchema.index({ status: 1, priority: 1, lastMessageAt: -1 });

export const SupportTicket = model<ISupportTicket>(
  'SupportTicket',
  supportTicketSchema
);
