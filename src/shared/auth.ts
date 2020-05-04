import { VerifyOptions, SignOptions, verify, sign } from 'jsonwebtoken';
import { AuthChecker } from 'type-graphql';
import { Context } from './context.interface';
import { SessionTokens } from './outputs/session.response';

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
    expiresIn: process.env.JWT_EXPIRATION || '1h'
  };
};

export const jwtRefreshVerifyOptions = (): VerifyOptions => {
  return {
    issuer: process.env.JWT_ISSUER || 'issuer',
    algorithms: ['HS256']
  };
};

export const jwtRefreshSignOptions = (): SignOptions => {
  return {
    issuer: process.env.JWT_ISSUER || 'issuer',
    expiresIn: process.env.JWT_EXPIRATION || '24h'
  };
};

export const verifyRefreshToken = async (token: string): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    verify(token, jwtSecret(), jwtRefreshVerifyOptions(), error => {
      if (error) reject(error);

      return resolve(true);
    });
  });
};

export const createTokens = (userId: string, permissions: string[]): SessionTokens => {
  // Sign token
  const token = sign(
    {
      sub: userId,
      permissions
    },
    jwtSecret(),
    jwtSignOptions()
  );

  const refreshToken = sign(
    {
      sub: userId,
      permissions
    },
    jwtSecret(),
    jwtRefreshSignOptions()
  );
  return { token, refreshToken };
};

export const authChecker: AuthChecker<Context> = ({ context: { token } }, requiredPermissions) => {
  // Deny if there is no user
  if (!token) return false;
  // Authorize if no permissions are required
  if (requiredPermissions.length === 0) return true;
  // // Authorize if user has required permissions
  return token.permissions && requiredPermissions.every(reqPerm => token.permissions.includes(reqPerm));
};
