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
    return this.updateOne({}, userRolesInput.userId, {
      relations: [{ key: 'roles', ids: userRolesInput.roleIds, tableName: 'role' }]
    });
  }

  @Authorized(['user:update'])
  @Mutation(() => UserResponse)
  public async updateUser(@Arg('userInput') userInput: UserInput): Promise<UserResponse> {
    return this.updateOne(userInput, userInput.id);
  }
}
