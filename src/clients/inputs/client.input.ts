import { InputType, Field } from 'type-graphql';

@InputType()
export class ClientInput {
  @Field()
  public companyRole: string;

  @Field()
  public userId: string;
}
