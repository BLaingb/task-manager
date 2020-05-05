import { Resolver, FieldResolver, Root, Query, Arg, Mutation } from 'type-graphql';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { Permission } from '../models/permission.model';
import { RoleResponse } from '../outputs/role.response';
import { RoleInput } from '../inputs/role.input';
import { validate } from 'class-validator';

@Resolver(of => Role)
export class RoleResolver {
  @FieldResolver()
  public async users(@Root() role: Role): Promise<User[]> {
    return User.getRepository()
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.roles', 'role')
      .where('role.id = :id', { id: role.id })
      .getMany();
  }

  @FieldResolver()
  public async permissions(@Root() role: Role): Promise<Permission[]> {
    return Permission.getRepository()
      .createQueryBuilder('permission')
      .innerJoinAndSelect('permission.roles', 'role')
      .where('role.id = :id', { id: role.id })
      .getMany();
  }

  @Query(() => [Role])
  public async roles(): Promise<Role[]> {
    return Role.find();
  }

  @Query(() => Role)
  public async role(@Arg('id') id: string): Promise<Role> {
    const role = await Role.findOne(id);
    if (!role) throw new Error(`Role with id: ${id} does not exist.`);
    return role;
  }

  @Mutation(() => RoleResponse)
  public async createRole(@Arg('roleInput') roleInput: RoleInput): Promise<RoleResponse> {
    const failureResponse: RoleResponse = {
      success: false,
      message: 'An error ocurred while creating a new role.'
    };
    const successResponse: RoleResponse = {
      success: true,
      message: 'Role created succesfully.'
    };
    let role = Role.create({ name: roleInput.name });

    const errors = await validate(role);
    if (errors.length > 0) {
      failureResponse.errors = errors.map(e => e.toString());
      return failureResponse;
    }

    try {
      role = await role.save();
    } catch {
      failureResponse.message = `A role with name ${role.name} already exists.`;
      return failureResponse;
    }

    if (!roleInput.permissionIds) {
      return {
        ...successResponse,
        data: role
      };
    }

    const permissions: Permission[] = await Permission.findByIds(roleInput.permissionIds);
    if (permissions.length < roleInput.permissionIds.length) {
      failureResponse.message = `${
        failureResponse.message
      } One or more permissions selected could not be found. No permissions were set to the new role.`;
      return failureResponse;
    }

    try {
      role.permissions = permissions;
      role = await role.save();
    } catch {
      failureResponse.message = `${failureResponse.message} No permissions were set to the new role.`;
      return failureResponse;
    }

    return {
      ...successResponse,
      data: role
    };
  }
}
