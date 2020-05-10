import { ClassType, Field, ObjectType, Int } from 'type-graphql';

export default function paginationResponse<T>(TClass: ClassType<T>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginationResponse {
    @Field(type => Int)
    public pageSize: number;

    @Field(type => Int)
    public page: number;

    @Field(type => Int)
    public total: number;

    @Field(type => [TClass])
    public items: T[];
  }
  return PaginationResponse;
}
