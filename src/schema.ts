import { buildSchema } from 'type-graphql';
import { authChecker } from './shared/auth';
import { usersResolvers } from './users/users';

export const createSchema = async () => {
  const schema = await buildSchema({
    resolvers: [...usersResolvers],
    emitSchemaFile: true,
    authChecker
  });
  return schema;
};
