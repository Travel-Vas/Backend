import { Document, FilterQuery, HydratedDocument, MergeType, Model, SaveOptions, UpdateQuery } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CustomError } from '../App';
import { ReasonPhrases } from 'http-status-codes';

export class DbRepository<T extends Document> {
  model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }

  public async create(
    data: Partial<Record<keyof T, unknown>>,
    projection: string | Record<string, unknown> = {},
    saveOptions?: SaveOptions,
  ): Promise<T> {
    try {
      const newData = new this.model({ ...data, uid: uuidv4() });

      await newData.save(saveOptions);

      const savedData = await this.model.findOne({ _id: newData._id }, projection);

      if(!savedData) throw new CustomError({ message: ReasonPhrases.INTERNAL_SERVER_ERROR})

      return savedData

    } catch (e:any) {
      console.log(e)
      throw new CustomError({ message: "Something went wrong", ctx: e });
    }
  }
  public async createMany(data: Partial<Record<keyof T, unknown>>[]): Promise<
    Array<
      MergeType<
        HydratedDocument<T, {}, {}>,
        Omit<
          Partial<Record<keyof T, unknown>> & {
            uid: string;
          },
          '_id'
        >
      >
    >
  > {
    try {
      const newArray = data.map((el: Partial<Record<keyof T, unknown>>) => ({
        ...el,
        uid: uuidv4(),
      }));
      return this.model.insertMany(newArray);
    } catch (e:any) {
      console.log(e);
      throw new CustomError({ message: "Something went wrong", ctx: e });
    }
  }

  public async findMany(
    conditions: Partial<Record<keyof T, unknown>>,
    projection: string | Record<string, unknown> = {},
    options: Record<string, unknown> = {},
  ): Promise<T[] | null> {
    try {
      return await this.model.find(
        conditions as FilterQuery<T>,
        projection,
        options,
      );
    } catch (e:any) {
      console.log(e);
      throw new CustomError({ message: "Something went wrong", ctx: e });
    }
  }

  public async findOne(
    conditions: Partial<Record<keyof T, unknown>>,
    projection: string | Record<string, number> = {},
    options: Record<string, unknown> = {},
  ) {
    try {
      return await this.model.findOne(
        conditions as FilterQuery<T>,
        projection,
        options,
      );
    } catch (e:any) {
      console.log(e);
      throw new CustomError({ message: "Something Went Wrong", ctx: e });
    }
  }

  public async findOneAndUpdate(
    data: UpdateQuery<T>,
    // data: Partial<Record<keyof T, unknown>>,
    conditions: Partial<Record<keyof T, unknown>>,
    projection: string | Record<string, number> = {},
    options: Record<string, unknown> = { new: true, runValidators: true },
  ) {
    try {
      const result = await this.model
        .findOneAndUpdate(
          conditions as FilterQuery<T>,
          data as UpdateQuery<T>,
          options,
        )
        .select(projection);

      return result;
    } catch (e:any) {
      console.log(e);
      throw new CustomError({ message: ReasonPhrases.INTERNAL_SERVER_ERROR, ctx: e });
    }
  }

  public async findOneAndDelete(
    conditions: Partial<Record<keyof T, unknown>>,
    projection: string | Record<string, number> = {},
    options: Record<string, unknown> = { new: true, runValidators: true },
  ) {
    try {
      const result = await this.model
        .findOneAndDelete(conditions as FilterQuery<T>, options)
        .select(projection);

      return result;
    }  catch (e:any) {
      console.log(e);
      throw new CustomError({ message: ReasonPhrases.INTERNAL_SERVER_ERROR, ctx: e });
    }
  }

  public async deleteMany (conditions: FilterQuery<T>,
                           options: Record<string, unknown> = { new: true, runValidators: true }) {
    try {
      return await this.model
        .deleteMany(conditions, options);
    }  catch (e:any) {
      console.log(e);
      throw new CustomError({ message: ReasonPhrases.INTERNAL_SERVER_ERROR, ctx: e });
    }
  }

  public getModel() {
    return this.model;
  }
}
