import { BaseRepository } from './BaseRepository';
import type { IAddress } from '../models/index';

export class AddressRepository extends BaseRepository<IAddress> {
  constructor() {
    super('addresses');
  }
}

export const addressRepository = new AddressRepository();
