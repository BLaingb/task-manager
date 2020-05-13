import { Arg, Authorized, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { getRepository } from 'typeorm';
import { PaginationInput } from '../../shared/inputs/pagination.input';
import { GenericResolver } from '../../shared/resolvers/generic.resolver';
import { UserInput } from '../inputs/user.input';
import { UserRolesInput } from '../inputs/userRoles.input';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { UserResponse } from '../outputs/user.response';
import { UserPagination } from '../outputs/userPagination.response';

// TODO: Add mutation for self register, with email verification.

@Resolver(of => User)
export class UserResolver extends GenericResolver<User> {
  protected className = 'User';
  protected repository = getRepository(User);

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
  @Query(() => UserPagination)
  public async users(@Arg('paginationInput') paginationInput: PaginationInput): Promise<UserPagination> {
    return this.findPaginated(paginationInput);
  }

  @Authorized(['user:create'])
  @Mutation(() => UserResponse)
  public async createUser(@Arg('userInput') userInput: UserInput): Promise<UserResponse> {
    return this.createOne(userInput, {
      preSaveFn: user => {
        user.password = User.hashPassword(user.password);
        return user;
      }
    });
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

  @Authorized(['user:update'])
  @Mutation(() => UserResponse)
  public async updateUser(@Arg('userInput') userInput: UserInput): Promise<UserResponse> {
    return this.updateOne(userInput, userInput.id);
  }
}
