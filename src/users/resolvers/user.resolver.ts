import { Arg, Authorized, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { GenericResolver } from '../../shared/resolvers/generic.resolver';
import { UserInput } from '../inputs/user.input';
import { UserRolesInput } from '../inputs/userRoles.input';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { UserResponse } from '../outputs/user.response';

@Resolver(of => User)
export class UserResolver extends GenericResolver {
  protected className = 'User';
  @FieldResolver()
  public async roles(@Root() user: User): Promise<Role[]> {
    return Role.getRepository()
      .createQueryBuilder('role')
      .innerJoinAndSelect('role.users', 'user')
      .where('user.id = :id', { id: user.id })
      .getMany();
  }

  @Authorized(['user:view'])
  @Query(() => User)
  public async user(@Arg('id') id: string): Promise<User> {
    const user = await User.findOne(id, { where: { active: true } });
    if (!user) throw new Error('User not found.');
    return user;
  }

  @Authorized(['user:list'])
  @Query(() => [User])
  public async users(): Promise<User[]> {
    return User.find({ where: { active: true } });
  }

  @Authorized(['user:create'])
  @Mutation(() => UserResponse)
  public async createUser(@Arg('userInput') userInput: UserInput): Promise<UserResponse> {
    const failureResponse: UserResponse = {
      success: false,
      message: 'An error ocurred while creating a new user.'
    };
    let user = User.create(userInput);

    const errors = await this.validationErrors(user);
    if (errors) {
      failureResponse.errors = errors;
      return failureResponse;
    }

    user.password = User.hashPassword(user.password);

    const result = await this.dbOperation(user.save);
    if (!result.success || !result.object) {
      failureResponse.message = `A user with email ${user.email} already exists.`;
      return failureResponse;
    }
    user = result.object;

    return {
      success: true,
      message: 'User created succesfully.',
      data: user
    };
  }

  @Authorized(['user:edit', 'roles:set'])
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

    user.roles = roles;
    const result = await this.dbOperation(user.save);
    if (!result.success || !result.object) return failureResponse;
    user = result.object;

    return {
      success: true,
      message: `Set ${userRolesInput.roleIds.length} roles to user successfully.`,
      data: user
    };
  }
}
