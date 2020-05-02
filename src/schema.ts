import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
// import { buildFederatedSchema } from '@apollo/federation';
// import { Subscription } from './resolvers/Subscription/Subscription';
import * as fs from 'fs';
import * as path from 'path';
import { makeExecutableSchema } from 'graphql-tools';
const typeDefs = [fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8')];

const resolvers = {
  // Query,
  // Mutation,
  // Subscription,
  Date: GraphQLDate,
  DateTime: GraphQLDateTime
};

const executableSchema = makeExecutableSchema({ typeDefs, resolvers });

export default executableSchema;
