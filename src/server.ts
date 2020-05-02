import { ApolloServer } from 'apollo-server-express';
import * as GraphiQL from 'apollo-server-module-graphiql';
import * as cors from 'cors';
import * as express from 'express';

import schema from './schema';

import { execute, subscribe } from 'graphql';
import { createServer, Server } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import * as url from 'url';

type ExpressGraphQLOptionsFunction = (req?: express.Request, res?: express.Response) => any | Promise<any>;

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

export default async (port: number): Promise<Server> => {
  const app = express();

  const server: Server = createServer(app);
  // frontend url:
  let corsOrigin: string[] = ['http://localhost:3000'];
  if (process.env.NODE_ENV === 'staging') {
    corsOrigin = ['https://<<staging url 1>>', 'https://<<staging url 2>>'];
  } else if (process.env.NODE_ENV === 'production') {
    corsOrigin = ['https://<<production url 1>>', 'https://<<production url 2>>'];
  }

  app.use(
    '*',
    cors({
      origin: corsOrigin
    })
  );

  const apolloServer = new ApolloServer({
    playground: process.env.NODE_ENV !== 'production',
    introspection: process.env.NODE_ENV !== 'production',
    schema,
    context: ({ req }: any) => {
      // get the user token from the headers
      const token = req.headers.authorization || '';

      // try to retrieve a user with the token
      const user = `User ${token}`;

      // add the user to the context
      return { user };
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
