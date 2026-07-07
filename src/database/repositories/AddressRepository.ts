import { BaseRepository } from './BaseRepository.ts';
import type { IAddress } from '../models/index.ts';

export class AddressRepository extends BaseRepository<IAddress> {
  constructor() {
    super('addresses');
  }
}

export const addressRepository = new AddressRepository();
