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
import { Role } from './role.model';

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
  @ManyToMany(() => Role, roles => roles.permissions)
  public roles: Role[];

  @Field()
  @CreateDateColumn()
  public createdAt: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt: Date;
}
