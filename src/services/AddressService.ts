import { BaseService } from './BaseService.ts';
import { addressRepository } from '../database/repositories/index.ts';
import type { IAddress } from '../database/models/index.ts';

export class AddressService extends BaseService<IAddress> {
  constructor() {
    super(addressRepository);
  }
}

export const addressService = new AddressService();
