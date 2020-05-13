import { ObjectType } from 'type-graphql';
import paginationResponse from '../../shared/outputs/pagination.response';
import { Permission } from '../models/permission.model';

@ObjectType()
export class PermissionPagination extends paginationResponse(Permission) {}
