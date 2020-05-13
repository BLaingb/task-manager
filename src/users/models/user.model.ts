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
import { Length, IsEmail, MinLength } from 'class-validator';
import { hashSync, compareSync } from 'bcrypt';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  public id: string;

  @Field()
  @Column({ unique: true })
  @IsEmail()
  public email: string;

  @Column({ select: false })
  @Length(8, 100)
  public password: string;

  @Field()
  @Column()
  @MinLength(3)
  public firstName: string;

  @Field({ nullable: true })
  @Column()
  public lastName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public profilePicture?: string;

  @Field()
  @Column({ default: true })
  public active: boolean;

  @Field()
  @Column({ default: false })
  public verified: boolean;

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

  public static hashPassword(password: string) {
    return hashSync(password, 8);
  }

  public checkPassword(password: string) {
    return compareSync(password, this.password);
  }
}
