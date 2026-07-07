import { Router } from 'express';
import { asyncHandler } from '../controllers/asyncHandler.ts';
import type { CrudController } from '../controllers/CrudController.ts';

export function createCrudRoutes<T extends Record<string, any>>(controller: CrudController<T>) {
  const router = Router();

  router.get('/', asyncHandler(controller.list.bind(controller)));
  router.get('/:id', asyncHandler(controller.getById.bind(controller)));
  router.post('/', asyncHandler(controller.create.bind(controller)));
  router.put('/:id', asyncHandler(controller.update.bind(controller)));
  router.delete('/:id', asyncHandler(controller.remove.bind(controller)));

  return router;
}
