import { UserResolver } from './resolvers/user.resolver';
import { RoleResolver } from './resolvers/role.resolver';
import { PermissionResolver } from './resolvers/permission.resolver';
import { AuthResolver } from './resolvers/auth.resolver';

export const usersResolvers = [UserResolver, RoleResolver, PermissionResolver, AuthResolver];
