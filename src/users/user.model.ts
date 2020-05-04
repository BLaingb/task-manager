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
import { Role } from './role.model';

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

  @Field(type => [Role], { nullable: true })
  @ManyToMany(() => Role, roles => roles.users)
  @JoinTable()
  public roles: Role[];

  @Field()
  @CreateDateColumn()
  public createdAt: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt: Date;
}
