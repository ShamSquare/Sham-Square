import type {
  Document,
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import type { BaseRepository } from '../database/repositories/BaseRepository.ts';

type CreatePayload<T extends Document> = Omit<T, keyof Document> & Record<string, unknown>;
type LeanResult<T extends Document> = Omit<T, keyof Document> & {
  _id: T extends { _id: infer U } ? U : unknown;
};

export abstract class BaseService<T extends Document> {
  protected readonly repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  create(data: CreatePayload<T>): Promise<T> {
    return this.repository.create(data);
  }

  getById(
    id: string,
    projection?: ProjectionType<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    return this.repository.findById(id, projection, options);
  }

  getByIdLean(
    id: string,
    projection?: ProjectionType<T>,
    options?: QueryOptions
  ): Promise<LeanResult<T> | null> {
    return this.repository.findByIdLean(id, projection, options);
  }

  findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    return this.repository.findOne(filter, projection, options);
  }

  findOneLean(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions
  ): Promise<LeanResult<T> | null> {
    return this.repository.findOneLean(filter, projection, options);
  }

  find(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions
  ): Promise<T[]> {
    return this.repository.find(filter, projection, options);
  }

  findLean(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions
  ): Promise<LeanResult<T>[]> {
    return this.repository.findLean(filter, projection, options);
  }

  updateById(
    id: string,
    update: UpdateQuery<T>,
    options: QueryOptions = { new: true }
  ): Promise<T | null> {
    return this.repository.findOneAndUpdate({ _id: id } as FilterQuery<T>, update, options);
  }

  updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions
  ) {
    return this.repository.updateOne(filter, update, options);
  }

  deleteById(id: string) {
    return this.repository.deleteOne({ _id: id } as FilterQuery<T>);
  }

  deleteMany(filter: FilterQuery<T>) {
    return this.repository.deleteMany(filter);
  }

  count(filter: FilterQuery<T> = {}) {
    return this.repository.count(filter);
  }

  exists(filter: FilterQuery<T>) {
    return this.repository.exists(filter);
  }
}
