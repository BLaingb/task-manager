// import { ObjectType, Field, ID } from 'type-graphql';

// @ObjectType()
// export class User {
//   @Field(() => ID)
//   public id: string;

//   @Field()
//   public firstName: string;

//   @Field({ nullable: true })
//   public lastName?: string;

//   @Field()
//   public profilePicture: string;

//   @Field()
//   public email: string;

//   @Field()
//   public active: boolean;

//   @Field()
//   public creationDate: Date;
// }

export class User {
  public id: string;
  public firstName: string;

  public lastName?: string;

  public profilePicture: string;

  public email: string;

  public active: boolean;

  public creationDate: Date;
}
