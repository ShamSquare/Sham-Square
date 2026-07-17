import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { asyncHandler } from '../controllers/asyncHandler';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', asyncHandler(authController.register.bind(authController)));
router.post('/login', asyncHandler(authController.login.bind(authController)));
router.post('/refresh', asyncHandler(authController.refresh.bind(authController)));
router.post('/forgot-password', asyncHandler(authController.forgotPassword.bind(authController)));
router.post('/verify-reset-code', asyncHandler(authController.verifyResetCode.bind(authController)));
router.post('/reset-password', asyncHandler(authController.resetPassword.bind(authController)));
router.get('/me', protect, asyncHandler(authController.me.bind(authController)));

export { router as authRoutes };
