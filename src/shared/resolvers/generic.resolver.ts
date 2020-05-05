import { validate } from 'class-validator';

export abstract class GenericResolver {
  protected abstract className: string;

  protected async dbOperation(operation: () => any, action: string) {
    try {
      return await operation();
    } catch {
      throw new Error(`Hubo un problema al realizar [${action}] de [${this.className}] en la base de datos.`);
    }
  }

  protected async validationErrors(toValidate: any): Promise<string[] | undefined> {
    const errors = await validate(toValidate);
    if (errors.length > 0) return errors.map(e => e.toString());
    return;
  }
}
