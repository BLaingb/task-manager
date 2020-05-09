/*
 * src/server.ts
 * This file is used to configure the server connection and the schema
 *
 * Last modified: 21/04/2020
 * Mariana Prado
 */
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import * as GraphiQL from 'apollo-server-module-graphiql';
import * as cors from 'cors';
import * as express from 'express';

import { execute, subscribe } from 'graphql';
import { createServer, Server } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import * as url from 'url';
import * as ejwt from 'express-jwt';
import { createSchema } from './schema';
import { createConnection } from 'typeorm';
import { jwtSecret } from './shared/auth';

type ExpressGraphQLOptionsFunction = (req?: express.Request, res?: express.Response) => any | Promise<any>;

/**
 * graphiqlExpress
 * @description GraphQL configuration
 * @param options
 * @returns arrow function
 */
function graphiqlExpress(options: GraphiQL.GraphiQLData | ExpressGraphQLOptionsFunction) {
  const graphiqlHandler = (req: express.Request, res: express.Response, next: any) => {
    const query = req.url && url.parse(req.url, true).query;
    GraphiQL.resolveGraphiQLString(query, options, req).then(
      (graphiqlString: any) => {
        res.setHeader('Content-Type', 'text/html');
        res.write(graphiqlString);
        res.end();
      },
      (error: any) => next(error)
    );
  };

  return graphiqlHandler;
}

/**
 * createConnection
 * @description server configuration
 * @param port
 * @returns Server
 */
export default async (port: number): Promise<Server> => {
  await createConnection();
  const app = express();

  const server: Server = createServer(app);
  // frontend url:
  let corsOrigin: string[] = ['http://localhost:3000'];
  if (process.env.NODE_ENV === 'develop-ci') {
    corsOrigin = [''];
  } else if (process.env.NODE_ENV === 'staging') {
    corsOrigin = [''];
  } else if (process.env.NODE_ENV === 'production') {
    corsOrigin = [''];
  }

  app.use(
    '*',
    cors({
      origin: corsOrigin
    }),
    ejwt({
      secret: jwtSecret(),
      credentialsRequired: false
    }),
    (err: any, _: any, res: any, next: any) => {
      // Handle UnauthorizedError for expired or invalid tokens
      if (err.name === 'UnauthorizedError') {
        res.status(err.status).send({ message: 'There was a problem with your session. Please log in again.' });
        return;
      }
      next();
    }
  );

  const schema = await createSchema();
  const apolloServer = new ApolloServer({
    playground: process.env.NODE_ENV !== 'production',
    introspection: process.env.NODE_ENV !== 'production',
    schema,
    context: ({ req }: any) => {
      const context = {
        req,
        token: req.user // `req.user` comes from `express-jwt`
      };
      return context;
    }
  });

  apolloServer.applyMiddleware({ app, path: '/graphql' });

  if (module.hot) {
    app.use(
      '/graphiql',
      graphiqlExpress({
        endpointURL: '/graphql',
        query:
          '# Welcome to your own GraphQL server!\n#\n' +
          '# Press Play button above to execute GraphQL query\n#\n' +
          '# You can start editing source code and see results immediately\n\n' +
          'query hello($subject:String) {\n  hello(subject: $subject)\n}',
        subscriptionsEndpoint: `ws://localhost:${port}/subscriptions`,
        variables: { subject: 'World' }
      })
    );
  }

  return new Promise<Server>(resolve => {
    server.listen(port, () => {
      // tslint:disable-next-line
      new SubscriptionServer(
        {
          execute,
          schema,
          subscribe
        },
        {
          path: '/subscriptions',
          server
        }
      );
      resolve(server);
    });
  });
};
