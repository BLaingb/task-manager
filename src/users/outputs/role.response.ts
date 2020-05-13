import { ObjectType } from 'type-graphql';
import mutationResponse from '../../shared/outputs/mutation.response';
import { Role } from '../models/role.model';

@ObjectType()
export class RoleResponse extends mutationResponse(Role) {}
