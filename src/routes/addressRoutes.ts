import { createCrudRoutes } from './routeFactory.ts';
import { addressController } from '../controllers/AddressController.ts';

export const addressRoutes = createCrudRoutes(addressController);
