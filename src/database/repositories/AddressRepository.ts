import { BaseRepository } from './BaseRepository.ts';
import { Address, type IAddress } from '../models/index.ts';

export class AddressRepository extends BaseRepository<IAddress> {
  constructor() {
    super(Address);
  }
}

export const addressRepository = new AddressRepository();
