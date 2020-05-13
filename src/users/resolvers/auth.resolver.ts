import { Arg, Mutation, Resolver } from 'type-graphql';
import { createTokens, verifyRefreshToken } from '../../shared/auth';
import { LoginInput } from '../inputs/login.input';
import { RefreshTokenInput } from '../inputs/refreshToken.input';
import { User } from '../models/user.model';
import { LoginResponse } from '../outputs/login.response';

@Resolver()
export class AuthResolver {
  @Mutation(type => LoginResponse)
  public async login(@Arg('loginInput') loginInput: LoginInput): Promise<LoginResponse> {
    const failureResponse: LoginResponse = { success: false, message: 'Invalid email or password.' };
    // Check if user exists
    const user = await User.findOne({
      select: ['id', 'email', 'password'],
      relations: ['roles', 'roles.permissions'],
      where: { email: loginInput.email, active: true }
    });
    if (!user) return failureResponse;

    // Check if passwords match
    if (!user.checkPassword(loginInput.password)) return failureResponse;

    // Get permissions from user roles
    const permissions = this.getPermissionsForUser(user);

    // Sign tokens
    const data = createTokens(user.id, permissions);

    return {
      success: true,
      data
    };
  }

  @Mutation(type => LoginResponse)
  public async refreshSession(@Arg('refreshTokenInput') refreshTokenInput: RefreshTokenInput): Promise<LoginResponse> {
    const failureResponse: LoginResponse = {
      success: false,
      message: 'Could not refresh session. Please log in again.'
    };
    // Check if user exists
    const user = await User.findOne({
      select: ['id', 'email', 'password'],
      relations: ['roles', 'roles.permissions'],
      where: { id: refreshTokenInput.userId, active: true }
    });
    if (!user) return failureResponse;

    try {
      const verified = await verifyRefreshToken(refreshTokenInput.refreshToken);
      if (!verified) return failureResponse;
    } catch {
      return failureResponse;
    }

    // Get permissions from user roles
    const permissions = this.getPermissionsForUser(user);

    // Sign tokens
    const data = createTokens(user.id, permissions);

    return {
      success: true,
      data
    };
  }

  private getPermissionsForUser(user: User): string[] {
    const permissions: string[] = [];
    user.roles.forEach(role => {
      role.permissions.forEach(p => permissions.push(p.name));
    });
    return permissions;
  }
}
