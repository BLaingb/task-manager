import { buildSchema } from 'type-graphql';
import { authChecker } from './shared/auth';
import { usersResolvers } from './users/users';
import { clientResolvers } from './clients/clients';

export const createSchema = async () => {
  const schema = await buildSchema({
    resolvers: [...usersResolvers, ...clientResolvers],
    emitSchemaFile: true,
    authChecker
  });
  return schema;
};
