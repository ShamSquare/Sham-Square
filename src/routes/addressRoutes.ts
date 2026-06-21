import { createCrudRoutes } from './routeFactory.js';
import { addressController } from '../controllers/AddressController.js';

export const addressRoutes = createCrudRoutes(addressController);
