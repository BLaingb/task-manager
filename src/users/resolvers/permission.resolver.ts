import { Arg, FieldResolver, Query, Resolver, Root } from 'type-graphql';
import { Permission } from '../models/permission.model';
import { Role } from '../models/role.model';
import { PermissionPagination } from '../outputs/permissionPagination.response';
import { GenericResolver } from '../../shared/resolvers/generic.resolver';
import { PaginationInput } from '../../shared/inputs/pagination.input';

@Resolver(of => Permission)
export class PermissionResolver extends GenericResolver<Permission> {
  protected className = 'Permission';
  protected repository = Permission.getRepository();
  @FieldResolver()
  public async roles(@Root() permission: Permission): Promise<Role[]> {
    return Role.getRepository()
      .createQueryBuilder('role')
      .innerJoinAndSelect('role.permissions', 'permission')
      .where('permission.id = :id', { id: permission.id })
      .getMany();
  }

  @Query(() => PermissionPagination)
  public async permissions(@Arg('paginationInput') paginationInput: PaginationInput): Promise<PermissionPagination> {
    return this.findPaginated(paginationInput);
  }

  @Query(() => Permission)
  public async permission(@Arg('id') id: string): Promise<Permission> {
    const permission = await Permission.findOne(id);
    if (!permission) throw new Error(`Permission with id: ${id} does not exist`);
    return permission;
  }
}
