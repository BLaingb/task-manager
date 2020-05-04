import { ObjectType } from 'type-graphql';
import mutationResponse from '../../shared/outputs/generic.response';
import { User } from '../models/user.model';

@ObjectType()
export class UserResponse extends mutationResponse(User) {}
