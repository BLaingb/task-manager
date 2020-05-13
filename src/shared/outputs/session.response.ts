import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class SessionTokens {
  @Field()
  public token: string;

  @Field()
  public refreshToken: string;
}
