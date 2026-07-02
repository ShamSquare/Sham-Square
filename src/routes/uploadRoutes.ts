import { Router } from 'express';
import { uploadController } from '../controllers/UploadController.ts';
import { asyncHandler } from '../controllers/asyncHandler.ts';

const router = Router();

router.post('/by-url', asyncHandler(uploadController.uploadByUrl.bind(uploadController)));

export { router as uploadRoutes };
