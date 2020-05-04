import { Arg, FieldResolver, Query, Resolver, Root } from 'type-graphql';
import { Permission } from '../models/permission.model';
import { Role } from '../models/role.model';

@Resolver(of => Permission)
export class PermissionResolver {
  @FieldResolver()
  public async roles(@Root() permission: Permission): Promise<Role[]> {
    return Role.getRepository()
      .createQueryBuilder('role')
      .innerJoinAndSelect('role.permissions', 'permission')
      .where('permission.id = :id', { id: permission.id })
      .getMany();
  }

  @Query(() => [Permission])
  public async permissions(): Promise<Permission[]> {
    return Permission.find();
  }

  @Query(() => Permission)
  public async permission(@Arg('id') id: string): Promise<Permission> {
    const permission = await Permission.findOne(id);
    if (!permission) throw new Error(`Permission with id: ${id} does not exist`);
    return permission;
  }
}
