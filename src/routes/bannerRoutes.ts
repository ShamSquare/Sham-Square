import { createCrudRoutes } from './routeFactory';
import { bannerController } from '../controllers/BannerController';

export const bannerRoutes = createCrudRoutes(bannerController);
