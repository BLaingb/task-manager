import { validate } from 'class-validator';
import { BaseEntity, DeepPartial, EntityManager, getManager, Repository } from 'typeorm';
import { OperationOptions } from '../operationOptions.interface';
import { OperationResult } from '../operationResult.interface';
import { PaginationInput } from '../inputs/pagination.input';

export abstract class GenericResolver<Model extends BaseEntity> {
  protected abstract readonly className: string;
  protected abstract readonly repository: Repository<Model>;

  protected async dbOperation<T = any>(databaseFn: () => Promise<T>): Promise<{ success: boolean; object?: T }> {
    try {
      const object = await databaseFn();
      return {
        success: true,
        object
      };
    } catch {
      return {
        success: false
      };
    }
  }

  protected async validationErrors(toValidate: any): Promise<string[] | undefined> {
    const errors = await validate(toValidate);
    if (errors.length > 0) return errors.map(e => e.toString());
    return;
  }

  protected async saveMany(entities: BaseEntity[]): Promise<BaseEntity[] | undefined> {
    const savedEntities: BaseEntity[] = [];
    const success = await this.executeInTransaction(async t => {
      for (const entity of entities) {
        try {
          const saved = await t.save(entity);
          if (!saved) return false;
          savedEntities.push(saved);
        } catch {
          return false;
        }
      }
      return true;
    });
    if (!success) return;
    return savedEntities;
  }

  protected async executeInTransaction(fn: (t: EntityManager) => Promise<boolean>): Promise<boolean> {
    return getManager().transaction(async transactionalManager => {
      return fn(transactionalManager);
    });
  }

  protected async createOne(
    input: DeepPartial<Model>,
    options: OperationOptions<Model> = {}
  ): Promise<{ success: boolean; message?: string; data?: Model; errors?: string[] }> {
    const failureResponse = {
      success: false,
      message: `An error ocurred while creating a new [${this.className}].`
    };

    const model = this.repository.create({
      ...input,
      id: undefined
    });

    const response = await this.saveObject(model, options);
    if (!response.success || !response.data)
      return {
        ...failureResponse,
        ...response
      };

    return {
      ...response,
      message: `[${this.className}] created succesfully.`
    };
  }

  protected async updateOne(
    values: DeepPartial<Model>,
    id?: string,
    options: OperationOptions<Model> = {}
  ): Promise<{ success: boolean; message?: string; data?: Model; errors?: string[] }> {
    const failureResponse = {
      success: false,
      message: `An error ocurred while updating a [${this.className}].`
    };

    if (!id)
      return {
        ...failureResponse,
        errors: ['No object id was provided']
      };

    const model = await this.repository.findOne(id);
    if (!model)
      return {
        ...failureResponse,
        errors: [`An object of type [${this.className}] with id [${id}] does not exist.`]
      };

    Object.assign(model, values);
    const response = await this.saveObject(model, options);

    if (!response.success || !response.data)
      return {
        ...failureResponse,
        ...response
      };

    return {
      ...response,
      message: `[${this.className}] updated succesfully.`
    };
  }

  protected async saveObject(
    model: Model,
    options: OperationOptions<Model>,
    defaultResponse: { success: boolean; data?: Model; errors?: string[] } = {
      success: false
    }
  ) {
    if (options.preValidationFn) model = await options.preValidationFn(model);

    const errors = await this.validationErrors(model);
    if (errors)
      return {
        ...defaultResponse,
        errors
      };

    if (options.preSaveFn) model = await options.preSaveFn(model);

    const response = await this.saveToDB(model);
    if (response.errors)
      return {
        ...defaultResponse,
        errors: response.errors
      };
    if (response.object) model = response.object;

    if (options.relations) {
      const saveRelationsResult = await this.saveRelations(model, options.relations);
      if (saveRelationsResult.errors)
        return {
          ...defaultResponse,
          errors: saveRelationsResult.errors
        };

      if (saveRelationsResult.object) model = saveRelationsResult.object;
    }

    if (options.postSaveFn) model = await options.postSaveFn(model);

    return {
      success: true,
      message: `[${this.className}] created succesfully.`,
      data: model
    };
  }

  protected async saveToDB<T extends BaseEntity = Model>(object: T): Promise<OperationResult<T>> {
    try {
      const saved = await object.save();
      return { object: saved };
    } catch (error) {
      console.group();
      console.error('Error in saveToDB');
      console.error(error);
      console.error('Object: ', object);
      console.groupEnd();
      return {
        errors: [`Error ${error.code}: [${error.name}] ${error.message}`]
      };
    }
  }

  protected async saveRelations<T extends BaseEntity = Model>(
    object: T,
    relations: Array<{ key: string; ids: string[]; tableName: string }>
  ): Promise<OperationResult<T>> {
    const errors: string[] = [];
    // Save relations in transaction
    const success = await this.executeInTransaction(async t => {
      for (const rel of relations) {
        // Get objects in relationship.
        // Using try catch block in case tableName is not an actual table,
        // and getting the repository fails. Need to look for a better
        // way to pass the Entity, maybe if I could get a way to pass the class?
        try {
          console.log('In here');
          const relationshipObjects = await t.getRepository(rel.tableName).findByIds(rel.ids);
          object[rel.key] = relationshipObjects;
        } catch (error) {
          console.group();
          console.error('Error in saveRelations');
          console.error(error);
          console.groupEnd();
          errors.push(error.message);
          return false;
        }

        // Save the object, after relations have been added.
        const response = await this.saveToDB(object);
        if (response.errors) {
          errors.push(...errors);
          return false;
        }
        if (response.object) object = response.object;
      }
      return true;
    });
    if (!success) return { errors };
    return { object };
  }

  protected async findPaginated(
    input: PaginationInput
  ): Promise<{ page: number; pageSize: number; total: number; items: Model[] }> {
    await validate(input);
    const skip = (input.page - 1) * input.take;
    const [items, total] = await this.repository.findAndCount({ skip, take: input.take });
    return {
      pageSize: input.take,
      page: input.page,
      total,
      items
    };
  }
}
