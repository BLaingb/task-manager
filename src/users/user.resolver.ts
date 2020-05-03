import { Arg, Query, Resolver } from 'type-graphql';
import { User } from './user.model';

@Resolver()
export class UserResolver {
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
