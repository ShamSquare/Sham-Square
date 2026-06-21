import { createCrudRoutes } from './routeFactory.js';
import { bannerController } from '../controllers/BannerController.js';

export const bannerRoutes = createCrudRoutes(bannerController);
