import { CrudController } from './CrudController.js';
import { addressService } from '../services/index.js';
import type { IAddress } from '../database/models/index.js';

export class AddressController extends CrudController<IAddress> {
  constructor() {
    super(addressService);
  }
}

export const addressController = new AddressController();
