import { Resolver, FieldResolver, Root, Query, Arg } from 'type-graphql';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { Permission } from '../models/permission.model';

@Resolver(of => Role)
export class RoleResolver {
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

  @Query(() => [Role])
  public async roles(): Promise<Role[]> {
    return Role.find();
  }

  @Query(() => Role)
  public async role(@Arg('id') id: string): Promise<Role> {
    const role = await Role.findOne(id);
    if (!role) throw new Error(`Role with id: ${id} does not exist`);
    return role;
  }
}
