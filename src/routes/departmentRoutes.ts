import { Router } from 'express';
import { departmentController } from '../controllers/DepartmentController';
import { asyncHandler } from '../controllers/asyncHandler';

const router = Router();

router.get('/', asyncHandler(departmentController.list.bind(departmentController)));
router.get('/:id', asyncHandler(departmentController.getById.bind(departmentController)));
router.post('/', asyncHandler(departmentController.create.bind(departmentController)));
router.put('/:id', asyncHandler(departmentController.update.bind(departmentController)));
router.delete('/:id', asyncHandler(departmentController.remove.bind(departmentController)));

export { router as departmentRoutes };