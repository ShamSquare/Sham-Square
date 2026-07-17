/**
 * OTP Routes
 * POST /api/send-otp  - Request an OTP
 * POST /api/verify-otp - Verify an OTP
 */

import { Router } from 'express';
import { otpController } from '../controllers/OtpController';
import { asyncHandler } from '../controllers/asyncHandler';
import { otpSendLimiter, otpVerifyLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/send-otp', otpSendLimiter, asyncHandler(otpController.sendOtp.bind(otpController)));
router.post('/verify-otp', otpVerifyLimiter, asyncHandler(otpController.verifyOtp.bind(otpController)));

export { router as otpRoutes };
