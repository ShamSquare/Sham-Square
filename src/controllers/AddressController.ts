import { CrudController } from './CrudController.ts';
import { addressService } from '../services/index.ts';
import type { IAddress } from '../database/models/index.ts';

export class AddressController extends CrudController<IAddress> {
  constructor() {
    super(addressService);
  }
}

export const addressController = new AddressController();
