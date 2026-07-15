/**
 * OTP Controller
 * Handles SMS OTP authentication requests
 */

import { Request, Response } from 'express';
import { otpService } from '../services/OtpService.ts';
import { BaseController } from './BaseController.ts';
import { AppError } from '../utils/app-error.util.ts';

export class OtpController extends BaseController {
  /**
   * POST /api/send-otp
   * Request an OTP to be sent via SMS
   */
  async sendOtp(req: Request, res: Response): Promise<void> {
    const { phone } = req.body;

    if (!phone || typeof phone !== 'string') {
      throw new AppError('Phone number is required', 400, 'VALIDATION_ERROR');
    }

    const result = await otpService.sendOtp(phone);

    if (!result.success) {
      // Return 200 with success:false so the client can handle it gracefully
      // without exposing internal error details
      this.sendSuccess(res, { success: false, message: result.error || 'Unable to send OTP' });
      return;
    }

    this.sendSuccess(res, { success: true, message: result.message });
  }

  /**
   * POST /api/verify-otp
   * Verify an OTP code
   */
  async verifyOtp(req: Request, res: Response): Promise<void> {
    const { phone, otp: code } = req.body;

    if (!phone || typeof phone !== 'string') {
      throw new AppError('Phone number is required', 400, 'VALIDATION_ERROR');
    }

    if (!code || typeof code !== 'string') {
      throw new AppError('Verification code is required', 400, 'VALIDATION_ERROR');
    }

    const result = await otpService.verifyOtp(phone, code);

    if (!result.success) {
      throw new AppError(result.error || 'Verification failed', 400, 'VERIFICATION_FAILED');
    }

    this.sendSuccess(res, { success: true, message: result.message });
  }
}

export const otpController = new OtpController();
