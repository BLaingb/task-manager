import { ObjectType } from 'type-graphql';
import paginationResponse from '../../shared/outputs/pagination.response';
import { User } from '../models/user.model';

@ObjectType()
export class UserPagination extends paginationResponse(User) {}
