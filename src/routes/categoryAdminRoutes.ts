import { Router } from 'express';
import { categoryAdminController } from '../controllers/CategoryAdminController';
import { asyncHandler } from '../controllers/asyncHandler';

const router = Router();

router.get('/', asyncHandler(categoryAdminController.list.bind(categoryAdminController)));
router.get('/:id', asyncHandler(categoryAdminController.getById.bind(categoryAdminController)));
router.post('/', asyncHandler(categoryAdminController.create.bind(categoryAdminController)));
router.put('/:id', asyncHandler(categoryAdminController.update.bind(categoryAdminController)));
router.delete('/:id', asyncHandler(categoryAdminController.remove.bind(categoryAdminController)));
router.patch('/:id/toggle-status', asyncHandler(categoryAdminController.toggleStatus.bind(categoryAdminController)));

export { router as categoryAdminRoutes };