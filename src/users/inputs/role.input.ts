import { InputType, Field } from 'type-graphql';

@InputType()
export class RoleInput {
  @Field({ nullable: true })
  public name?: string;

  @Field(type => [String], { nullable: true })
  public permissionIds?: string[];
}
