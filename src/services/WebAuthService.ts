/**
 * Web Authentication Service
 * Handles web user registration, authentication, and profile management
 */

import { BaseService } from './BaseService';
import { webUserRepository } from '../database/repositories/WebUserRepository';
import type { IWebUser } from '../database/models/WebUser';

export class WebAuthService extends BaseService<IWebUser> {
  constructor() {
    super(webUserRepository);
  }

  async register(userData: Partial<IWebUser>): Promise<IWebUser> {
    const data = await this.create(userData);
    await this.updateById(data.id, { version: 1 });
    return data;
  }

  async login(email: string, passwordHash: string): Promise<IWebUser | null> {
    const user = await this.findOne({ email, isDeleted: false, status: 'ACTIVE' });
    if (!user) return null;
    return user;
  }

  async loginByPhone(phone: string, passwordHash: string): Promise<IWebUser | null> {
    const user = await this.findOne({ phone, isDeleted: false, status: 'ACTIVE' });
    if (!user) return null;
    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.updateById(userId, { lastLoginAt: new Date() });
  }

  async getUserById(userId: string): Promise<IWebUser | null> {
    return this.getById(userId);
  }

  async markPhoneVerified(userId: string): Promise<void> {
    await this.updateById(userId, { phoneVerified: true });
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.updateById(userId, { emailVerified: true });
  }

  async updateEmail(userId: string, email: string): Promise<void> {
    await this.updateById(userId, { email, emailVerified: false });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.updateById(userId, { isDeleted: true, deletedAt: new Date() });
  }
}

export const webAuthService = new WebAuthService();