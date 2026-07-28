/**
 * Web Users Model
 * Represents the website users (separate from mobile users for authentication independence)
 */

import { CategoryType } from '../enums';

export interface IWebUser {
   id: string;
   email: string;
   passwordHash: string;
   firstName: string;
   lastName: string;
   avatar?: string | null;
   phone?: string | null;
   role: string;
   roleType: string;
   categoryType?: CategoryType | null;
   status: string;
   emailVerified: boolean;
   phoneVerified: boolean;
   lastLoginAt?: Date | null;
   createdAt: Date;
   updatedAt: Date;
   deletedAt?: Date | null;
   isDeleted: boolean;
   version: number;
 }
