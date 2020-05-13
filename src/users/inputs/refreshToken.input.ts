import { InputType, Field } from 'type-graphql';

@InputType()
export class RefreshTokenInput {
  @Field()
  public userId: string;

  @Field()
  public refreshToken: string;
}
