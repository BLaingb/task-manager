import { VerifyOptions, SignOptions } from 'jsonwebtoken';
import { AuthChecker } from 'type-graphql';
import { Context } from './context.interface';

export const jwtSecret = (): string => process.env.JWT_SECRET || 'secret';

export const jwtVerifyOptions = (): VerifyOptions => {
  return {
    issuer: process.env.JWT_ISSUER || 'issuer',
    algorithms: ['HS256']
  };
};

export const jwtSignOptions = (): SignOptions => {
  return {
    issuer: process.env.JWT_ISSUER || 'issuer',
    expiresIn: process.env.JWT_EXPIRATION || '1hr'
  };
};

export const authChecker: AuthChecker<Context> = ({ context: { token } }, requiredPermissions) => {
  // Deny if there is no user
  if (!token) return false;
  // Authorize if no permissions are required
  if (requiredPermissions.length === 0) return true;
  // // Authorize if user has required permissions
  return token.permissions && requiredPermissions.every(reqPerm => token.permissions.includes(reqPerm));
};
