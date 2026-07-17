import { createCrudRoutes } from './routeFactory';
import { addressController } from '../controllers/AddressController';

export const addressRoutes = createCrudRoutes(addressController);
