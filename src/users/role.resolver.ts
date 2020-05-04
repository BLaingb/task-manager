import { Resolver, FieldResolver, Root, Query } from 'type-graphql';
import { Role } from './role.model';
import { User } from './user.model';

@Resolver(of => Role)
export class RoleResolver {
  @FieldResolver()
  public async users(@Root() role: Role): Promise<User[]> {
    const users = User.getRepository()
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.roles', 'role')
      .where('role.id = :id', { id: role.id })
      .getMany();
    if (!users) throw new Error('The role has no users');
    return users;
  }

  @Query(() => [Role])
  public async roles(): Promise<Role[]> {
    return Role.find();
  }
}
