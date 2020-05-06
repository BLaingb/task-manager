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

  protected async save(entities: BaseEntity[]): Promise<BaseEntity[] | undefined> {
    const savedEntities: BaseEntity[] = [];
    for (const entity of entities) {
      try {
        const saved = await getManager().save(entity);
        if (!saved) return;
        savedEntities.push(saved);
      } catch {
        return;
      }
    }
    return savedEntities;
  }
}
