import { createCrudRoutes } from './routeFactory';
import { settingController } from '../controllers/SettingController';

export const settingRoutes = createCrudRoutes(settingController);
