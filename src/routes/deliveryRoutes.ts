import { Router } from 'express';
import { deliveryController } from '../controllers/DeliveryController';
import { asyncHandler } from '../controllers/asyncHandler';

const router = Router();

router.get('/', asyncHandler(deliveryController.list.bind(deliveryController)));
router.get('/:id', asyncHandler(deliveryController.getById.bind(deliveryController)));
router.post('/', asyncHandler(deliveryController.create.bind(deliveryController)));
router.put('/:id', asyncHandler(deliveryController.update.bind(deliveryController)));
router.delete('/:id', asyncHandler(deliveryController.remove.bind(deliveryController)));
router.patch('/:id/toggle-status', asyncHandler(deliveryController.toggleStatus.bind(deliveryController)));

export { router as deliveryRoutes };