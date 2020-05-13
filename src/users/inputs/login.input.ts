import { InputType, Field } from 'type-graphql';

@InputType()
export class LoginInput {
  @Field()
  public email: string;

  @Field()
  public password: string;
}
