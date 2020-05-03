import { ObjectType, Field, ID } from 'type-graphql';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  public id: string;

  @Field()
  @Column()
  public firstName: string;

  @Field({ nullable: true })
  @Column()
  public lastName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public profilePicture?: string;

  @Field()
  @Column()
  public email: string;

  @Field()
  @Column()
  public active: boolean;

  @Field()
  @Column()
  public creationDate: Date;
}
