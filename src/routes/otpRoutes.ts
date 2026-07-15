/**
 * OTP Routes
 * POST /api/send-otp  - Request an OTP
 * POST /api/verify-otp - Verify an OTP
 */

import { Router } from 'express';
import { otpController } from '../controllers/OtpController.ts';
import { asyncHandler } from '../controllers/asyncHandler.ts';
import { otpSendLimiter, otpVerifyLimiter } from '../middlewares/rateLimiter.middleware.ts';

const router = Router();

router.post('/send-otp', otpSendLimiter, asyncHandler(otpController.sendOtp.bind(otpController)));
router.post('/verify-otp', otpVerifyLimiter, asyncHandler(otpController.verifyOtp.bind(otpController)));

export { router as otpRoutes };
