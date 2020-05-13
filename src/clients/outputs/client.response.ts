import { ObjectType } from 'type-graphql';
import mutationResponse from '../../shared/outputs/mutation.response';
import { Client } from '../models/client.model';

@ObjectType()
export class ClientResponse extends mutationResponse(Client) {}
