import { ObjectType } from 'type-graphql';
import paginationResponse from '../../shared/outputs/pagination.response';
import { Role } from '../models/role.model';

@ObjectType()
export class RolePagination extends paginationResponse(Role) {}
