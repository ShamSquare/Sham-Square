/**
 * Web Users Model
 * Represents the website users (separate from mobile users for authentication independence)
 */

export interface IWebUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  phone?: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  isDeleted: boolean;
  version: number;
}
