import { validate } from 'class-validator';
import { Arg, FieldResolver, Mutation, Query, Resolver, Root, Authorized } from 'type-graphql';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { UserResponse } from '../outputs/user.response';
import { UserInput } from '../inputs/user.input';

@Resolver(of => User)
export class UserResolver {
  @FieldResolver()
  public async roles(@Root() user: User): Promise<Role[]> {
    return Role.getRepository()
      .createQueryBuilder('role')
      .innerJoinAndSelect('role.users', 'user')
      .where('user.id = :id', { id: user.id })
      .getMany();
  }

  @Query(() => User)
  public async user(@Arg('id') id: string): Promise<User> {
    const user = await User.findOne(id, { where: { active: true } });
    if (!user) throw new Error('User not found');
    return user;
  }

  @Authorized()
  @Query(() => [User])
  public async users(): Promise<User[]> {
    return User.find({ where: { active: true } });
  }

  @Mutation(() => UserResponse)
  public async createUser(@Arg('user') userInput: UserInput): Promise<UserResponse> {
    const failureResponse: UserResponse = {
      success: false,
      message: 'An error ocurred while creating a new user'
    };
    let user = User.create(userInput);

    const errors = await validate(user);
    if (errors.length > 0) {
      failureResponse.errors = errors.map(e => e.toString());
      return failureResponse;
    }

    user.password = User.hashPassword(user.password);
    try {
      user = await user.save();
    } catch {
      failureResponse.message = `A user with email ${user.email} already exists`;
      return failureResponse;
    }

    return {
      success: true,
      message: 'User created succesfully',
      data: user
    };
  }
}
