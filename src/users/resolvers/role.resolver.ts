import { Arg, FieldResolver, Mutation, Query, Resolver, Root, Authorized } from 'type-graphql';
import { GenericResolver } from '../../shared/resolvers/generic.resolver';
import { RoleInput } from '../inputs/role.input';
import { Permission } from '../models/permission.model';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { RoleResponse } from '../outputs/role.response';

@Resolver(of => Role)
export class RoleResolver extends GenericResolver<Role> {
  protected className = 'Role';
  protected repository = Role.getRepository();

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

  @Authorized(['roles:list'])
  @Query(() => [Role])
  public async roles(): Promise<Role[]> {
    return Role.find();
  }

  @Authorized(['roles:view'])
  @Query(() => Role)
  public async role(@Arg('id') id: string): Promise<Role> {
    const role = await Role.findOne(id);
    if (!role) throw new Error(`Role with id: ${id} does not exist.`);
    return role;
  }

  @Authorized(['roles:create'])
  @Mutation(() => RoleResponse)
  public async createRole(@Arg('roleInput') roleInput: RoleInput): Promise<RoleResponse> {
    return this.createOne(
      { ...roleInput, permissions: undefined },
      {
        relations: [{ key: 'permissions', ids: roleInput.permissionIds || [], tableName: 'permission' }]
      }
    );
  }

  @Authorized(['roles:update'])
  @Mutation(() => RoleResponse)
  public async updateRole(@Arg('roleInput') roleInput: RoleInput): Promise<RoleResponse> {
    const failureResponse: RoleResponse = {
      success: false,
      message: 'An error ocurred while updating a role.'
    };

    const successResponse: RoleResponse = {
      success: true,
      message: 'Role updated succesfully.'
    };

    if (!roleInput.id) {
      failureResponse.message = `${failureResponse.message} A role id was not provided.`;
      return failureResponse;
    }

    const role = await Role.findOne(roleInput.id);
    if (!role) {
      failureResponse.message = `${failureResponse.message} The role to update does not exist.`;
      return failureResponse;
    }

    role.name = roleInput.name || role.name;
    return this.saveRole(role, roleInput, successResponse, failureResponse);
  }

  private async saveRole(
    role: Role,
    roleInput: RoleInput,
    successResponse: RoleResponse,
    failureResponse: RoleResponse
  ): Promise<RoleResponse> {
    const errors = await this.validationErrors(role);
    if (errors) {
      failureResponse.errors = errors;
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
      } One or more permissions selected could not be found. No permissions were set to the role.`;
      return failureResponse;
    }

    role.permissions = permissions;
    const result = await this.dbOperation(role.save);
    if (!result.success || !result.object) {
      failureResponse.message = `${failureResponse.message} No permissions were set to the role.`;
      return failureResponse;
    }
    role = result.object;

    return {
      ...successResponse,
      data: role
    };
  }
}
