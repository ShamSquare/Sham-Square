import { Router } from 'express';
import { departmentAdminController } from '../controllers/DepartmentAdminController';
import { asyncHandler } from '../controllers/asyncHandler';

const router = Router();

router.get('/', asyncHandler(departmentAdminController.list.bind(departmentAdminController)));
router.get('/:id', asyncHandler(departmentAdminController.getById.bind(departmentAdminController)));
router.post('/', asyncHandler(departmentAdminController.create.bind(departmentAdminController)));
router.put('/:id', asyncHandler(departmentAdminController.update.bind(departmentAdminController)));
router.delete('/:id', asyncHandler(departmentAdminController.remove.bind(departmentAdminController)));
router.patch('/:id/toggle-status', asyncHandler(departmentAdminController.toggleStatus.bind(departmentAdminController)));

export { router as departmentAdminRoutes };