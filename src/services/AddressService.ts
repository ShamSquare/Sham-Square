import { BaseService } from './BaseService';
import { addressRepository } from '../database/repositories/index';
import type { IAddress } from '../database/models/index';

export class AddressService extends BaseService<IAddress> {
  constructor() {
    super(addressRepository);
  }
}

export const addressService = new AddressService();
