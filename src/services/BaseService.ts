import type { BaseRepository } from '../database/repositories/BaseRepository.ts';

export abstract class BaseService<T extends Record<string, any>> {
  protected readonly repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.repository.create(data);
  }

  async getById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    return this.repository.findOne(filter);
  }

  async find(filter?: Partial<T>, options?: { limit?: number; offset?: number; orderBy?: string; orderDir?: 'asc' | 'desc' }): Promise<T[]> {
    return this.repository.find(filter, options);
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return this.repository.updateById(id, data);
  }

  async updateOne(filter: Partial<T>, data: Partial<T>): Promise<T | null> {
    return this.repository.updateOne(filter, data);
  }

  async deleteById(id: string): Promise<void> {
    return this.repository.deleteById(id);
  }

  async deleteMany(filter: Partial<T>): Promise<void> {
    return this.repository.deleteMany(filter);
  }

  async count(filter?: Partial<T>): Promise<number> {
    return this.repository.count(filter);
  }

  async exists(filter: Partial<T>): Promise<boolean> {
    return this.repository.exists(filter);
  }
}
