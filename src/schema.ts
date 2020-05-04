import { UserResolver } from './users/user.resolver';
import { buildSchema } from 'type-graphql';
import { RoleResolver } from './users/role.resolver';

export const createSchema = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver, RoleResolver]
  });
  return schema;
};
