import { Request, Response } from 'express';
import { webAuthService } from '../services/WebAuthService';
import { otpService } from '../services/OtpService';
import { emailService } from '../services/EmailService';
import jwtUtil, { blacklistToken } from '../utils/jwt.util';
import { hashPassword, verifyPassword } from '../utils/password.util';
import { AppError } from '../utils/app-error.util';
import { BaseController } from './BaseController';
import { mapRoleToTokenRole } from '../config/jwt.config';
import { RoleName } from '../database/enums/index';

export class WebAuthController extends BaseController {
  async register(req: Request, res: Response) {
    const { firstName, lastName, phone, password } = req.body;

    if (!firstName || !lastName || !phone || !password) {
      throw new AppError('Missing required fields', 400);
    }

    // Check if user with this phone already exists
    const existingUser = await webAuthService.findOne({ phone });
    if (existingUser) throw new AppError('Phone number already in use', 409);

    const passwordHash = hashPassword(password);
    const userData = {
      email: '', // Email is optional, will be added later
      passwordHash,
      firstName,
      lastName,
      phone,
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: false,
      phoneVerified: false,
    };

    const user = await webAuthService.register(userData);

    // Send OTP for phone verification
    const otpResult = await otpService.sendOtp(phone);
    if (!otpResult.success) {
      console.warn('Failed to send OTP after registration:', otpResult.error);
    }

    return this.sendSuccess(res, {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
      },
      requiresPhoneVerification: true,
      message: 'Account created. Please verify your phone number.',
    });
  }

  async sendOtp(req: Request, res: Response) {
    const { phone } = req.body;
    if (!phone) {
      throw new AppError('Phone number is required', 400);
    }

    const result = await otpService.sendOtp(phone);
    if (!result.success) {
      throw new AppError(result.error || 'Failed to send OTP', 400);
    }

    return this.sendSuccess(res, { message: result.message });
  }

  async verifyOtp(req: Request, res: Response) {
    const { phone, code } = req.body;
    if (!phone || !code) {
      throw new AppError('Phone and verification code are required', 400);
    }

    const result = await otpService.verifyOtp(phone, code);
    if (!result.success) {
      throw new AppError(result.error || 'Verification failed', 400);
    }

    // Mark phone as verified in database
    const user = await webAuthService.findOne({ phone });
    if (user) {
      await webAuthService.markPhoneVerified(user.id);
    }

    // Generate tokens for the user
    if (!user?.id) {
      throw new Error("User ID is missing");
    }
    // Get managed category for department admins
    let managedCategory: string | undefined;
    if (user.role === RoleName.DEPARTMENT_ADMIN) {
      managedCategory = user.managedCategory || user.categoryType || undefined;
    }

    const payload = {
      userId: user?.id,
      phone: user?.phone,
      email: user.email || '',
      role: mapRoleToTokenRole(user?.role || 'USER'),
      ...(managedCategory && { managedCategory }),
    };
    const tokens = jwtUtil.generateTokenPair(payload);

    const userResponse = user
      ? {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          phoneVerified: true,
          emailVerified: user.emailVerified,
        }
      : null;

    return this.sendSuccess(res, { user: userResponse, token: tokens.accessToken });
  }

  async resendOtp(req: Request, res: Response) {
    const { phone } = req.body;
    if (!phone) {
      throw new AppError('Phone number is required', 400);
    }

    // sendOtp handles cooldown and replaces the previous OTP automatically
    const result = await otpService.sendOtp(phone);
    if (!result.success) {
      throw new AppError(result.error || 'Failed to resend OTP', 400);
    }

    return this.sendSuccess(res, { message: result.message });
  }

  async addEmail(req: Request, res: Response) {
    const { email } = req.body;
    const userId = (req as any).user?.userId;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Check if email is already in use
    const existingUser = await webAuthService.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    // Update user with new email
    await webAuthService.updateEmail(userId, email);

    // Send verification email
    await emailService.sendVerificationEmail(email);

    return this.sendSuccess(res, { message: 'Email added. Please verify it.' });
  }

  async sendEmailVerification(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const user = await webAuthService.getUserById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.email) {
      throw new AppError('No email associated with account', 400);
    }

    if (user.emailVerified) {
      throw new AppError('Email is already verified', 400);
    }

    await emailService.sendVerificationEmail(user.email);

    return this.sendSuccess(res, { message: 'Verification email sent' });
  }

  async verifyEmail(req: Request, res: Response) {
    const { code } = req.body;
    const userId = (req as any).user?.userId;

    if (!code) {
      throw new AppError('Verification code is required', 400);
    }

    const result = await emailService.verifyEmail(code);
    if (!result.success) {
      throw new AppError(result.error || 'Verification failed', 400);
    }

    await webAuthService.markEmailVerified(userId);

    const user = await webAuthService.getUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    let managedCategory: string | undefined;
    if (user.role === RoleName.DEPARTMENT_ADMIN) {
      managedCategory = user.managedCategory || user.categoryType || undefined;
    }

    const payload = {
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: mapRoleToTokenRole(user.role),
      ...(managedCategory && { managedCategory }),
    };
    const tokens = jwtUtil.generateTokenPair(payload);

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      emailVerified: true,
    };

    return this.sendSuccess(res, { user: userResponse, token: tokens.accessToken });
  }

  async resendEmailVerification(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const user = await webAuthService.getUserById(userId);

    if (!user || !user.email) {
      throw new AppError('No email associated with account', 400);
    }

    await emailService.sendVerificationEmail(user.email);

    return this.sendSuccess(res, { message: 'Verification email resent' });
  }

  async login(req: Request, res: Response) {
    const { phone, email, password } = req.body;

    if ((!phone && !email) || !password) {
      throw new AppError('Missing credentials', 400);
    }

    const filter = phone ? { phone } : { email };
    const user = await webAuthService.findOne({ ...filter, isDeleted: false, status: 'ACTIVE' });
    if (!user) throw new AppError('Invalid credentials', 401);

    const isValidPassword = verifyPassword(password, user.passwordHash);
    if (!isValidPassword) throw new AppError('Invalid credentials', 401);

    // Check if phone is verified for phone-based login
    if (phone && !user.phoneVerified) {
      throw new AppError('Phone number not verified. Please verify your phone first.', 403);
    }

    await webAuthService.updateLastLogin(user.id);

    // Get managed category for department admins
    let managedCategory: string | undefined;
    if (user.role === RoleName.DEPARTMENT_ADMIN) {
      managedCategory = user.managedCategory || user.categoryType || undefined;
    }

    const payload = {
      userId: user.id,
      email: user.email || '',
      phone: user.phone,
      role: mapRoleToTokenRole(user.role),
      ...(managedCategory && { managedCategory }),
    };

    const tokens = jwtUtil.generateTokenPair(payload);

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      phone: user.phone,
      role: user.role,
      roleType: user.roleType,
      categoryType: user.categoryType,
      managedCategory: managedCategory,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    return this.sendSuccess(res, {
  user: userResponse,
  tokens: {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  },
});
  }
  async me(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const user = await webAuthService.getUserById(userId);
    if (!user) throw new AppError('User not found', 404);

    // Get managed category for department admins
    let managedCategory: string | undefined;
    if (user.role === RoleName.DEPARTMENT_ADMIN) {
      managedCategory = user.managedCategory || user.categoryType || undefined;
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      phone: user.phone,
      role: user.role,
      roleType: user.roleType,
      categoryType: user.categoryType,
      managedCategory: managedCategory,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    return this.sendSuccess(res, userResponse);
  }

  async logout(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : null;

    if (token) {
      blacklistToken(token);
    }

    return this.sendSuccess(res, {
      message: 'Successfully logged out',
      userId: userId,
    });
  }
}

export const webAuthController = new WebAuthController();