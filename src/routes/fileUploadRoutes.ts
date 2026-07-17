import { Router } from 'express';
import { fileUploadController } from '../controllers/FileUploadController';
import { asyncHandler } from '../controllers/asyncHandler';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: '/tmp/uploads' });

// Unified file upload endpoints for both mobile and web clients
router.post('/upload', upload.single('file'), asyncHandler(fileUploadController.uploadByFile.bind(fileUploadController)));
router.post('/upload-multiple', upload.array('files'), asyncHandler(fileUploadController.uploadMultiple.bind(fileUploadController)));
router.post('/by-url', asyncHandler(fileUploadController.uploadByUrl.bind(fileUploadController)));

export { router as fileUploadRoutes };