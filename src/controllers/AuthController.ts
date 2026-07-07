import { Request, Response } from 'express';
import { userService, roleService } from '../services/index.ts';
import jwtUtil from '../utils/jwt.util.ts';
import passwordUtil from '../utils/password.util.ts';
import { AppError } from '../utils/app-error.util.ts';
import { RoleName } from '../database/enums/index.ts';

interface IResetRecord {
  code: string;
  expiresAt: number;
}

const resetStore: Record<string, IResetRecord> = {};

export class AuthController {
  async register(req: Request, res: Response) {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password || !firstName || !lastName) {
      throw new AppError('Missing required fields', 400);
    }

    const exists = await userService.exists({ email });
    if (exists) throw new AppError('Email already in use', 409);

    const role = await roleService.findOne({ name: RoleName.USER });
    const roleId = role ? role.id : undefined;

    const passwordHash = passwordUtil.hashPassword(password);

    const user = await userService.create({
      email,
      phone,
      passwordHash,
      firstName,
      lastName,
      roleId,
    });

    res.status(201).json({ success: true, data: { id: user.id, email, firstName, lastName, phone } });
  }

  async login(req: Request, res: Response) {
    const { phone, email, password } = req.body;
    if ((!phone && !email) || !password) throw new AppError('Missing credentials', 400);

    const filter = phone ? { phone } : { email };
    const user = await userService.findOne(filter);
    if (!user) throw new AppError('Invalid credentials', 401);

    const ok = passwordUtil.verifyPassword(password, user.passwordHash);
    if (!ok) throw new AppError('Invalid credentials', 401);

    const payload = {
      userId: user.id,
      email: user.email || '',
      role: 'user' as const,
    };

    const tokens = jwtUtil.generateTokenPair(payload);

    res.json({ success: true, data: { tokens, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone } } });
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Missing refresh token', 400);
    const decoded = jwtUtil.verifyRefreshToken(refreshToken);
    const payload = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    const tokens = jwtUtil.generateTokenPair(payload);
    res.json({ success: true, data: { tokens } });
  }

  async forgotPassword(req: Request, res: Response) {
    const { identifier } = req.body;
    if (!identifier) throw new AppError('Missing identifier', 400);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetStore[identifier] = { code, expiresAt: Date.now() + 1000 * 60 * 15 };

    // eslint-disable-next-line no-console
    console.info(`Password reset code for ${identifier}: ${code}`);

    res.json({ success: true, data: { resetCodeSent: true } });
  }

  async verifyResetCode(req: Request, res: Response) {
    const { identifier, code } = req.body;
    const record = resetStore[identifier];
    if (!record || record.code !== code || record.expiresAt < Date.now()) {
      throw new AppError('Invalid or expired reset code', 400);
    }
    res.json({ success: true, data: { verified: true } });
  }

  async resetPassword(req: Request, res: Response) {
    const { identifier, code, password } = req.body;
    const record = resetStore[identifier];
    if (!record || record.code !== code || record.expiresAt < Date.now()) {
      throw new AppError('Invalid or expired reset code', 400);
    }

    let user = await userService.findOne({ email: identifier });
    if (!user) {
      user = await userService.findOne({ phone: identifier });
    }
    if (!user) throw new AppError('User not found', 404);

    const passwordHash = passwordUtil.hashPassword(password);
    await userService.updateById(user.id, { passwordHash });

    delete resetStore[identifier];

    res.json({ success: true, data: { reset: true } });
  }

  async me(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const user = await userService.getById(userId);
    if (!user) throw new AppError('User not found', 404);

    res.json({ success: true, data: { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, avatar: user.avatar } } });
  }
}

export const authController = new AuthController();
