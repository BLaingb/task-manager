export interface OperationResult<T> {
  errors?: string[];
  object?: T;
}
