import { InputType, Field } from 'type-graphql';

@InputType()
export class RoleInput {
  @Field()
  public name: string;

  @Field(type => [String])
  public permissionIds: string[];
}
