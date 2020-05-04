import { validate } from 'class-validator';
import { Arg, FieldResolver, Mutation, Query, Resolver, Root, Authorized } from 'type-graphql';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { UserResponse } from '../outputs/user.response';
import { UserInput } from '../inputs/user.input';
import { UserRolesInput } from '../inputs/userRoles.input';

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

  // @Authorized(['user:view'])
  @Query(() => User)
  public async user(@Arg('id') id: string): Promise<User> {
    const user = await User.findOne(id, { where: { active: true } });
    if (!user) throw new Error('User not found');
    return user;
  }

  // @Authorized(['user:list'])
  @Query(() => [User])
  public async users(): Promise<User[]> {
    return User.find({ where: { active: true } });
  }

  @Authorized(['user:create'])
  @Mutation(() => UserResponse)
  public async createUser(@Arg('userInput') userInput: UserInput): Promise<UserResponse> {
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

  // @Authorized(['user:edit', 'roles:set'])
  @Mutation(() => UserResponse)
  public async setUserRoles(@Arg('userRolesInput') userRolesInput: UserRolesInput): Promise<UserResponse> {
    const failureResponse: UserResponse = {
      success: false,
      message: `An error ocurred while setting ${userRolesInput.roleIds.length} roles to a user.`
    };

    if (userRolesInput.roleIds.length === 0) {
      failureResponse.message = `${failureResponse.message} No Roles were selected.`;
      return failureResponse;
    }

    const roles: Role[] = await Role.findByIds(userRolesInput.roleIds);
    if (roles.length < userRolesInput.roleIds.length) {
      failureResponse.message = `${
        failureResponse.message
      } One or more roles selected could not be found. No roles were set.`;
      return failureResponse;
    }

    let user = await User.findOne(userRolesInput.userId, { where: { active: true } });
    if (!user) {
      failureResponse.message = `${failureResponse.message} The user could not be found.`;
      return failureResponse;
    }

    try {
      user.roles = roles;
      user = await user.save();
    } catch {
      return failureResponse;
    }

    return {
      success: true,
      message: `Set ${userRolesInput.roleIds.length} roles to user successfully.`,
      data: user
    };
  }
}
