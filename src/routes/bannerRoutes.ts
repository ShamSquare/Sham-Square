import { createCrudRoutes } from './routeFactory.ts';
import { bannerController } from '../controllers/BannerController.ts';

export const bannerRoutes = createCrudRoutes(bannerController);
