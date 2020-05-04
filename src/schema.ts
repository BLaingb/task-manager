import { UserResolver } from './users/resolvers/user.resolver';
import { buildSchema } from 'type-graphql';
import { RoleResolver } from './users/resolvers/role.resolver';
import { PermissionResolver } from './users/resolvers/permission.resolver';
import { AuthResolver } from './users/resolvers/auth.resolver';

export const createSchema = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver, RoleResolver, PermissionResolver, AuthResolver]
  });
  return schema;
};
