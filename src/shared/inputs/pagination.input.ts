import { InputType, Field, Int } from 'type-graphql';
import { Min } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(type => Int)
  @Min(1)
  public page: number;

  @Field(type => Int)
  @Min(1)
  public take: number;
}
