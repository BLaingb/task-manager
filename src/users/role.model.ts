import { ObjectType, Field, ID } from 'type-graphql';
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany
} from 'typeorm';
import { User } from './user.model';
import { Permission } from './permission.model';

@ObjectType()
@Entity()
export class Role extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  public id: string;

  @Field()
  @Column()
  public name: string;

  @Field()
  @ManyToMany(() => User, user => user.roles)
  public users: User[];

  @Field()
  @ManyToMany(() => Permission, permission => permission.roles)
  public permissions: Permission[];

  @Field()
  @CreateDateColumn()
  public createdAt: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt: Date;
}
