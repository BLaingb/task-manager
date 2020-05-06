import { validate } from 'class-validator';
import { EntityManager, TransactionManager, Transaction, BaseEntity, getManager } from 'typeorm';

export abstract class GenericResolver {
  protected abstract className: string;

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
}
