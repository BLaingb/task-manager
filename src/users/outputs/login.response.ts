import { ObjectType } from 'type-graphql';
import mutationResponse from '../../shared/generic.response';

@ObjectType()
export class LoginResponse extends mutationResponse(String) {}
