import { Request, Response } from 'express';
import { userService, roleService } from '../services/index';
import jwtUtil from '../utils/jwt.util';
import passwordUtil from '../utils/password.util';
import { AppError } from '../utils/app-error.util';
import { RoleName } from '../database/enums/index';
import { BaseController } from './BaseController';
import { otpService } from '../services/OtpService';

interface IResetRecord {
  code: string;
  expiresAt: number;
}

interface IRegistrationRecord {
  firstName: string;
  lastName: string;
  password: string;
  expiresAt: number;
}

const resetStore: Record<string, IResetRecord> = {};
const registrationStore = new Map<string, IRegistrationRecord>();

export class AuthController extends BaseController {
  async register(req: Request, res: Response) {
    const { firstName, lastName, phone, password } = req.body;
    
    if (!firstName || !lastName || !phone || !password) {
      throw new AppError('All fields are required', 400);
    }

    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    const existingUser = await userService.findOne({ phone: normalizedPhone });
    if (existingUser) {
      throw new AppError('Phone number is already registered', 409);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    const otpResult = await otpService.sendOtp(normalizedPhone);
    if (!otpResult.success) {
      throw new AppError(otpResult.error || 'Failed to send verification code', 400);
    }

    // Store registration data temporarily
    registrationStore.set(normalizedPhone, {
      firstName,
      lastName,
      password,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return this.sendSuccess(res, { 
      success: true, 
      message: 'Verification code sent to your phone',
      phone: normalizedPhone 
    });
  }

  async completeRegistration(req: Request, res: Response) {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      throw new AppError('Phone number and OTP are required', 400);
    }

    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

    const otpResult = await otpService.verifyOtp(normalizedPhone, otp);
    if (!otpResult.success) {
      throw new AppError(otpResult.error || 'Invalid or expired verification code', 400);
    }

    const regData = registrationStore.get(normalizedPhone);
    if (!regData || regData.expiresAt < Date.now()) {
      registrationStore.delete(normalizedPhone);
      throw new AppError('Registration data not found or expired. Please restart registration.', 400);
    }

    const existingUser = await userService.findOne({ phone: normalizedPhone });
    if (existingUser) {
      registrationStore.delete(normalizedPhone);
      throw new AppError('Phone number is already registered', 409);
    }

    const role = await roleService.findOne({ name: RoleName.USER });
    const roleId = role ? role.id : undefined;

    const passwordHash = passwordUtil.hashPassword(regData.password);

    const user = await userService.create({
      phone: normalizedPhone,
      passwordHash,
      firstName: regData.firstName,
      lastName: regData.lastName,
      roleId,
      email: normalizedPhone + '@temp.com',
    });

    registrationStore.delete(normalizedPhone);

    const payload = {
      userId: user.id,
      email: user.email || '',
      phone: user.phone,
      role: 'user' as const,
    };

    const tokens = jwtUtil.generateTokenPair(payload);

    return this.sendSuccess(res, { 
      success: true,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      tokens 
    });
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

    return this.sendSuccess(res, { tokens, user });
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Missing refresh token', 400);
    const decoded = jwtUtil.verifyRefreshToken(refreshToken);
    const payload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      ...(decoded.managedCategory && { managedCategory: decoded.managedCategory }),
    };
    const tokens = jwtUtil.generateTokenPair(payload);
    return this.sendSuccess(res, { tokens });
  }

  async forgotPassword(req: Request, res: Response) {
    const { identifier } = req.body;
    if (!identifier) throw new AppError('Phone number is required', 400);

    const normalizedPhone = identifier.replace(/[\s\-\(\)]/g, '');

    const user = await userService.findOne({ phone: normalizedPhone });
    if (!user) {
      return this.sendSuccess(res, { resetCodeSent: true });
    }

    const smsResult = await otpService.sendOtp(normalizedPhone);
    if (!smsResult.success) {
      throw new AppError('Failed to send verification code', 400);
    }

    return this.sendSuccess(res, { resetCodeSent: true });
  }

  async verifyResetCode(req: Request, res: Response) {
    const { identifier, code } = req.body;
    if (!identifier || !code) {
      throw new AppError('Phone number and code are required', 400);
    }

    const normalizedPhone = identifier.replace(/[\s\-\(\)]/g, '');

    // Use OTP service to verify the code
    const otpResult = await otpService.verifyOtp(normalizedPhone, code);
    if (!otpResult.success) {
      throw new AppError(otpResult.error || 'Invalid or expired reset code', 400);
    }

    return this.sendSuccess(res, { verified: true });
  }

  async resetPassword(req: Request, res: Response) {
    const { identifier, code, password } = req.body;
    if (!identifier || !code || !password) {
      throw new AppError('Phone number, code, and new password are required', 400);
    }

    const normalizedPhone = identifier.replace(/[\s\-\(\)]/g, '');

    // Verify the OTP code again before resetting password
    const otpResult = await otpService.verifyOtp(normalizedPhone, code);
    if (!otpResult.success) {
      throw new AppError(otpResult.error || 'Invalid or expired reset code', 400);
    }

    // Find user by phone
    const user = await userService.findOne({ phone: normalizedPhone });
    if (!user) throw new AppError('User not found', 404);

    // Update password
    const passwordHash = passwordUtil.hashPassword(password);
    await userService.updateById(user.id, { passwordHash });

    return this.sendSuccess(res, { reset: true });
  }

  async me(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const user = await userService.getById(userId);
    if (!user) throw new AppError('User not found', 404);

    return this.sendSuccess(res, user);
  }
}

export const authController = new AuthController();
