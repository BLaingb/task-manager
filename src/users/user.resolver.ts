import { Arg, Query, Resolver, FieldResolver, Root } from 'type-graphql';
import { User } from './user.model';
import { Role } from './role.model';

@Resolver(of => User)
export class UserResolver {
  @FieldResolver()
  public async roles(@Root() user: User): Promise<Role[]> {
    const roles = Role.find({ where: { users: { id: user.id } } });
    if (!roles) throw new Error('User has no roles');
    return roles;
  }

  @Query(() => User)
  public async user(@Arg('id') id: string): Promise<User> {
    const user = await User.findOne(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  @Query(() => [User])
  public async users(): Promise<User[]> {
    return User.find();
  }
}
