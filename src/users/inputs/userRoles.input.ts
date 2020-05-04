import { Field, InputType } from 'type-graphql';

@InputType()
export class UserRolesInput {
  @Field()
  public userId: string;

  @Field(type => [String])
  public roleIds: string[];
}
