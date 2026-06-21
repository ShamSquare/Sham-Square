import { createCrudRoutes } from './routeFactory.js';
import { settingController } from '../controllers/SettingController.js';

export const settingRoutes = createCrudRoutes(settingController);
