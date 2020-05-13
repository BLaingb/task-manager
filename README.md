# Task-Manager GraphQL Backend

## Prerequisites
* node v@10.12.0
* npm v@6.4.1

## Initial Setup

Install the node module dependencies
```bash
npm install
```

## Environment Variables
Important configuration variables to set in project:
 * NODE_ENV: development | staging | production
 * JWT_ISSUER: Issuer for generating and verifying Auth tokens.
 * JWT_EXPIRATION: Expiration time for creating new tokens.
 * JWT_REFRESH_EXPIRATION: Expiration time for session refresh tokens.
 * PORT: Port on which the application will run.

## Database Seed

## Running the project
To start the apollo-server, run from the terminal the following command:
```bash
npm run serve
```

This will build the project, and then run a live server, which will refresh on file changes.
Access the GraphQL Playground to start testing on: http://localhost:4000/graphql
