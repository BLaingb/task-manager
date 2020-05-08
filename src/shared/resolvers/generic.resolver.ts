import { validate } from 'class-validator';
import { BaseEntity, DeepPartial, EntityManager, getManager, Repository } from 'typeorm';

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
    } catch (error) {
      console.error(error);
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
    repository: Repository<Model>,
    input: DeepPartial<Model>,
    options?: {
      preValidationFn?: (object: Model) => Model;
      preSaveFn?: (object: Model) => Model;
    }
  ): Promise<{ success: boolean; message?: string; data?: Model; errors?: string[] }> {
    const failureResponse = {
      success: false,
      message: `An error ocurred while creating a new [${this.className}].`
    };

    let model = this.repository.create({
      ...input,
      id: undefined
    });

    if (options && options.preValidationFn) model = options.preValidationFn(model);

    const errors = await this.validationErrors(model);
    if (errors)
      return {
        ...failureResponse,
        errors
      };

    if (options && options.preSaveFn) model = options.preSaveFn(model);

    try {
      model = await model.save();
    } catch (error) {
      console.error('Error 2: ', error);
      return failureResponse;
    }

    return {
      success: true,
      message: `[${this.className}] created succesfully.`,
      data: model
    };
  }
}
