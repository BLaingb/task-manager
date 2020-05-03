import { Arg, Query, Resolver } from 'type-graphql';
import { User } from './users.model';

@Resolver()
export class UserResolver {
  @Query(returns => User)
  public async user(@Arg('id') id: string): Promise<User> {
    const user = new User();
    user.active = true;
    user.creationDate = new Date();
    user.email = 'bernardo.laing@gmail.com';
    user.firstName = 'Bernardo';
    user.lastName = 'Laing';
    user.id = '1';
    user.profilePicture = 'path/to/picture';
    return user;
  }

  @Query(returns => [User])
  public async users(): Promise<User[]> {
    const user = new User();
    user.active = true;
    user.creationDate = new Date();
    user.email = 'bernardo.laing@gmail.com';
    user.firstName = 'Bernardo';
    user.lastName = 'Laing';
    user.id = '1';
    user.profilePicture = 'path/to/picture';
    const user2 = new User();
    user2.active = true;
    user2.creationDate = new Date();
    user2.email = 'bernardo.laing2@gmail.com';
    user2.firstName = 'Bernardo2';
    user2.lastName = 'Laing2';
    user2.id = '2';
    user2.profilePicture = 'path/to/picture2';
    return [user, user2];
  }
}
