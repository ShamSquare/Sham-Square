import { Router } from 'express';
import { webAuthController } from '../controllers/WebAuthController.ts';
import { asyncHandler } from '../controllers/asyncHandler.ts';
import { protect } from '../middlewares/auth.middleware.ts';

const router = Router();

router.post('/register', asyncHandler(webAuthController.register.bind(webAuthController)));
router.post('/login', asyncHandler(webAuthController.login.bind(webAuthController)));
router.get('/me', protect, asyncHandler(webAuthController.me.bind(webAuthController)));
router.post('/logout', protect, asyncHandler(webAuthController.logout.bind(webAuthController)));

export { router as webAuthRoutes };
