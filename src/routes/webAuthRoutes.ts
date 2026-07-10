import { Router } from 'express';
import { webAuthController } from '../controllers/WebAuthController.ts';
import { asyncHandler } from '../controllers/asyncHandler.ts';
import { protect } from '../middlewares/auth.middleware.ts';

const router = Router();

router.post('/register', asyncHandler(webAuthController.register.bind(webAuthController)));
router.post('/login', asyncHandler(webAuthController.login.bind(webAuthController)));
router.post('/send-otp', asyncHandler(webAuthController.sendOtp.bind(webAuthController)));
router.post('/verify-otp', asyncHandler(webAuthController.verifyOtp.bind(webAuthController)));
router.post('/resend-otp', asyncHandler(webAuthController.resendOtp.bind(webAuthController)));
router.post('/add-email', protect, asyncHandler(webAuthController.addEmail.bind(webAuthController)));
router.post('/send-email-verification', protect, asyncHandler(webAuthController.sendEmailVerification.bind(webAuthController)));
router.post('/verify-email', protect, asyncHandler(webAuthController.verifyEmail.bind(webAuthController)));
router.post('/resend-email-verification', protect, asyncHandler(webAuthController.resendEmailVerification.bind(webAuthController)));
router.get('/me', protect, asyncHandler(webAuthController.me.bind(webAuthController)));
router.post('/logout', protect, asyncHandler(webAuthController.logout.bind(webAuthController)));

export { router as webAuthRoutes };
