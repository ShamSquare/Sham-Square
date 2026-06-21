import { BaseService } from './BaseService.js';
import { addressRepository } from '../database/repositories/index.js';
import type { IAddress } from '../database/models/index.js';

export class AddressService extends BaseService<IAddress> {
  constructor() {
    super(addressRepository);
  }
}

export const addressService = new AddressService();
