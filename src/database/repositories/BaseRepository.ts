import type {
  Document,
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  Types,
  UpdateQuery,
} from 'mongoose';

type LeanResult<T extends Document> = any;

export abstract class BaseRepository<T extends Document> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  create(doc: Omit<T, keyof Document> & Record<string, unknown>): Promise<T> {
    return this.model.create(doc as any);
  }

  findById(
    id: string | Types.ObjectId,
    projection?: ProjectionType<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    return this.model.findById(id, projection, options).exec();
  }

  findByIdLean(
    id: string | Types.ObjectId,
    projection?: ProjectionType<T>,
    options?: any
  ): Promise<any | null> {
    return this.model.findById(id, projection, options).lean().exec();
  }

  findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    return this.model.findOne(filter, projection, options).exec();
  }

  findOneLean(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: any
  ): Promise<any | null> {
    return this.model.findOne(filter, projection, options).lean().exec();
  }

  find(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: any
  ): Promise<any[]> {
    return this.model.find(filter, projection, options).exec();
  }

  findLean(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: any
  ): Promise<any[]> {
    return this.model.find(filter, projection, options).lean().exec();
  }

  findOneAndUpdate(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options: any = { new: true }
  ): Promise<any | null> {
    return this.model.findOneAndUpdate(filter, update, options).exec();
  }

  updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: any
  ) {
    return this.model.updateOne(filter, update, options).exec();
  }

  updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: any
  ) {
    return this.model.updateMany(filter, update, options).exec();
  }

  deleteOne(filter: FilterQuery<T>, options?: any) {
    return this.model.deleteOne(filter, options).exec();
  }

  deleteMany(filter: FilterQuery<T>, options?: any) {
    return this.model.deleteMany(filter, options).exec();
  }

  count(filter: FilterQuery<T> = {}) {
    return this.model.countDocuments(filter).exec();
  }

  exists(filter: FilterQuery<T>) {
    return this.model.exists(filter).exec().then((result) => result !== null);
  }

  aggregate<TOutput = unknown>(pipeline: any[]) {
    return this.model.aggregate<TOutput>(pipeline).exec();
  }
}
