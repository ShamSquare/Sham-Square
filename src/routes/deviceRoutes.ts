import { Router } from 'express';
import { deviceController } from '../controllers/DeviceController.ts';
import { asyncHandler } from '../controllers/asyncHandler.ts';
import { protect } from '../middlewares/auth.middleware.ts';

const router = Router();

router.post('/register', protect, asyncHandler(deviceController.register.bind(deviceController)));
router.post('/unregister', protect, asyncHandler(deviceController.unregister.bind(deviceController)));
router.get('/', protect, asyncHandler(deviceController.list.bind(deviceController)));

export { router as deviceRoutes };
