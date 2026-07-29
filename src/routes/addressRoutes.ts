import { Router } from 'express';
import { createCrudRoutes } from './routeFactory';
import { addressController } from '../controllers/AddressController';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler } from '../controllers/asyncHandler';

const router = Router();

// All address routes require authentication
router.use(protect);

// Standard CRUD routes
router.get('/', asyncHandler(addressController.list.bind(addressController)));
router.get('/:id', asyncHandler(addressController.getById.bind(addressController)));
router.post('/', asyncHandler(addressController.create.bind(addressController)));
router.put('/:id', asyncHandler(addressController.update.bind(addressController)));
router.delete('/:id', asyncHandler(addressController.remove.bind(addressController)));

export { router as addressRoutes };
