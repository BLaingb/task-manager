import { Arg, FieldResolver, Mutation, Query, Resolver, Root, Authorized } from 'type-graphql';
import { GenericResolver } from '../../shared/resolvers/generic.resolver';
import { RoleInput } from '../inputs/role.input';
import { Permission } from '../models/permission.model';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { RoleResponse } from '../outputs/role.response';
import { RolePagination } from '../outputs/rolePagination.response';
import { PaginationInput } from '../../shared/inputs/pagination.input';

@Resolver(of => Role)
export class RoleResolver extends GenericResolver<Role> {
  protected className = 'Role';
  protected repository = Role.getRepository();

  @FieldResolver()
  public async users(@Root() role: Role): Promise<User[]> {
    return User.getRepository()
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.roles', 'role')
      .where('role.id = :id', { id: role.id })
      .getMany();
  }

  @FieldResolver()
  public async permissions(@Root() role: Role): Promise<Permission[]> {
    return Permission.getRepository()
      .createQueryBuilder('permission')
      .innerJoinAndSelect('permission.roles', 'role')
      .where('role.id = :id', { id: role.id })
      .getMany();
  }

  @Authorized(['roles:list'])
  @Query(() => RolePagination)
  public async roles(@Arg('paginationInput') paginationInput: PaginationInput): Promise<RolePagination> {
    return this.findPaginated(paginationInput);
  }

  @Authorized(['roles:view'])
  @Query(() => Role)
  public async role(@Arg('id') id: string): Promise<Role> {
    const role = await Role.findOne(id);
    if (!role) throw new Error(`Role with id: ${id} does not exist.`);
    return role;
  }

  @Authorized(['roles:create'])
  @Mutation(() => RoleResponse)
  public async createRole(@Arg('roleInput') roleInput: RoleInput): Promise<RoleResponse> {
    return this.createOne(
      { ...roleInput, permissions: undefined },
      {
        relations: [{ key: 'permissions', ids: roleInput.permissionIds || [], tableName: 'permission' }]
      }
    );
  }

  @Authorized(['roles:update'])
  @Mutation(() => RoleResponse)
  public async updateRole(@Arg('roleInput') roleInput: RoleInput): Promise<RoleResponse> {
    return this.updateOne({ ...roleInput }, roleInput.id, {
      relations: [{ key: 'permissions', ids: roleInput.permissionIds || [], tableName: 'permission' }]
    });
  }
}
