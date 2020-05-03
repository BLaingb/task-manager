import { UserResolver } from './users/user.resolver';
import { buildSchema } from 'type-graphql';

export const createSchema = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver]
  });
  return schema;
};
