import { ObjectType } from 'type-graphql';
import mutationResponse from '../../shared/outputs/generic.response';
import { SessionTokens } from '../../shared/outputs/session.response';

@ObjectType()
export class LoginResponse extends mutationResponse(SessionTokens) {}
