import { InputType, Field } from 'type-graphql';

@InputType()
export class UserInput {
  @Field()
  public email: string;

  @Field()
  public password: string;

  @Field()
  public firstName: string;

  @Field({ nullable: true })
  public lastName?: string;

  @Field({ nullable: true })
  public profilePicture?: string;
}
