import { ObjectType, Field, ID } from 'type-graphql';
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { User } from './user.model';
import { Permission } from './permission.model';
import { MinLength } from 'class-validator';

@ObjectType()
@Entity()
export class Role extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  public id: string;

  @Field()
  @Column({ unique: true })
  @MinLength(3)
  public name: string;

  @Field(type => [User], { nullable: true })
  @ManyToMany(() => User, user => user.roles)
  public users: User[];

  @Field(type => [Permission], { nullable: true })
  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable()
  public permissions: Permission[];

  @Field()
  @CreateDateColumn()
  public createdAt: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt: Date;
}
