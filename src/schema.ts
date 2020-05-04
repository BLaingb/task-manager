import { UserResolver } from './users/user.resolver';
import { buildSchema } from 'type-graphql';
import { RoleResolver } from './users/role.resolver';
import { PermissionResolver } from './users/permission.resolver';

export const createSchema = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver, RoleResolver, PermissionResolver]
  });
  return schema;
};
