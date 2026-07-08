import { Request, Response } from 'express';
import { webAuthService } from '../services/WebAuthService.ts';
import jwtUtil from '../utils/jwt.util.ts';
import { hashPassword, verifyPassword } from '../utils/password.util.ts';
import { AppError } from '../utils/app-error.util.ts';
import { BaseController } from './BaseController.ts';
import { mapRoleToTokenRole } from '../config/jwt.config.ts';

export class WebAuthController extends BaseController {
  async register(req: Request, res: Response) {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      throw new AppError('Missing required fields', 400);
    }

    const existingUser = await webAuthService.findOne({ email });
    if (existingUser) throw new AppError('Email already in use', 409);

    const passwordHash = hashPassword(password);
    const userData = {
      email,
      passwordHash,
      firstName,
      lastName,
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: false,
    };

    const user = await webAuthService.register(userData);

    const payload = {
      userId: user.id,
      email: user.email,
      role: mapRoleToTokenRole(user.role),
    };

    const tokens = jwtUtil.generateTokenPair(payload);

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return this.sendSuccess(res, { user: userResponse, token: tokens.accessToken });
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Missing required fields', 400);
    }

    const user = await webAuthService.findOne({ email, isDeleted: false, status: 'ACTIVE' });
    if (!user) throw new AppError('Invalid credentials', 401);

    const isValidPassword = verifyPassword(password, user.passwordHash);
    if (!isValidPassword) throw new AppError('Invalid credentials', 401);

    await webAuthService.updateLastLogin(user.id);

    const payload = {
      userId: user.id,
      email: user.email,
      role: mapRoleToTokenRole(user.role),
    };

    const tokens = jwtUtil.generateTokenPair(payload);

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return this.sendSuccess(res, { user: userResponse, token: tokens.accessToken });
  }

  async me(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const user = await webAuthService.getUserById(userId);
    if (!user) throw new AppError('User not found', 404);

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      phone: user.phone,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    return this.sendSuccess(res, userResponse);
  }

  async logout(req: Request, res: Response) {
    return this.sendSuccess(res, { message: 'Successfully logged out' });
  }
}

export const webAuthController = new WebAuthController();
