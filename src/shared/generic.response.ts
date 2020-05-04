import { ClassType, Field, ObjectType } from 'type-graphql';

export default function mutationResponse<T>(TClass: ClassType<T>) {
  @ObjectType({ isAbstract: true })
  abstract class MutationResponse {
    @Field()
    public success: boolean;

    @Field({ nullable: true })
    public message?: string;

    @Field(type => [String], { nullable: true })
    public errors?: string[];

    @Field(type => TClass, { nullable: true })
    public data?: T;
  }
  return MutationResponse;
}
