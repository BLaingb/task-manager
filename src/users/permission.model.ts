import { ObjectType, Field, ID } from 'type-graphql';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Permission extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  public id: string;

  @Field()
  @Column()
  public name: string;

  @Field()
  @CreateDateColumn()
  public createdAt: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt: Date;
}
