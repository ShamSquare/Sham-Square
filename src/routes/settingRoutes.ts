import { createCrudRoutes } from './routeFactory.ts';
import { settingController } from '../controllers/SettingController.ts';

export const settingRoutes = createCrudRoutes(settingController);
