export interface OperationOptions<T> {
  preValidationFn?: (object: T) => T | Promise<T>;
  preSaveFn?: (object: T) => T | Promise<T>;
  postSaveFn?: (object: T) => T | Promise<T>;
  relations?: Array<{ key: string; id?: string; ids?: string[]; tableName: string }>;
}
