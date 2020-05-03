import { AuthenticationError } from 'apollo-server-express';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

const AUTH0_ISSUER = 'https://natgas.auth0.com/';
const AUTH0_AUDIENCE = 'https://impulsate/api';

const client = jwksClient({
  jwksUri: `${AUTH0_ISSUER}.well-known/jwks.json`,
  cache: true
});

function getKey(header: any, cb: any) {
  client.getSigningKey(header.kid, (err, key: any) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    cb(null, signingKey);
  });
}

const options: jwt.VerifyOptions = {
  audience: AUTH0_AUDIENCE,
  issuer: AUTH0_ISSUER,
  algorithms: ['RS256']
};

export const getUser = (token: string) => {
  return new Promise((resolve, reject) => {
    if (token === 'NNNNNNN') {
      return reject('token no provisto');
    }
    resolve({ id: '1', permissions: ['1', '2'] });
    jwt.verify(token, getKey, options, (err: any, decoded: any) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

export async function authorize(user: any, permission: string) {
  let auth0User;
  try {
    auth0User = await user; // catching the reject from the user promise.
  } catch (e) {
    console.log('error, no autenticado: ' + e);
    throw new AuthenticationError('Sesión no iniciada.');
  }

  if (!auth0User || !auth0User.permissions || !auth0User.permissions.includes(permission)) {
    console.log('no tienes permiso');
    throw new AuthenticationError('No tienes permisos para realizar esta acción.');
  }
}
