import * as jwt from 'jsonwebtoken';
import { Arg, Mutation, Resolver } from 'type-graphql';
import { jwtSecret, jwtSignOptions } from '../../shared/auth';
import { LoginInput } from '../inputs/login.input';
import { User } from '../models/user.model';
import { LoginResponse } from '../outputs/login.response';

@Resolver()
export class AuthResolver {
  @Mutation(type => LoginResponse)
  public async login(@Arg('loginData') loginData: LoginInput): Promise<LoginResponse> {
    const failureResponse: LoginResponse = { success: false, message: 'Invalid email or password.' };
    // Check if user exists
    const user = await User.findOne({
      select: ['id', 'email', 'password'],
      relations: ['roles', 'roles.permissions'],
      where: { email: loginData.email, active: true }
    });
    if (!user) return failureResponse;

    // Check if passwords match
    if (!user.checkPassword(loginData.password)) return failureResponse;

    // Get permissions from user roles
    const permissions: string[] = [];
    user.roles.forEach(role => {
      role.permissions.forEach(p => permissions.push(p.name));
    });

    // Sign token
    const token = jwt.sign(
      {
        sub: user.id,
        permissions
      },
      jwtSecret(),
      jwtSignOptions()
    );

    return {
      success: true,
      data: token
    };
  }
}
