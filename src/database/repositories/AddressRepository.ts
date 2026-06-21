import { BaseRepository } from './BaseRepository.js';
import { Address, type IAddress } from '../models/index.js';

export class AddressRepository extends BaseRepository<IAddress> {
  constructor() {
    super(Address);
  }
}

export const addressRepository = new AddressRepository();
