import { CrudController } from './CrudController';
import { addressService } from '../services/index';
import type { IAddress } from '../database/models/index';

export class AddressController extends CrudController<IAddress> {
  constructor() {
    super(addressService);
  }
}

export const addressController = new AddressController();
