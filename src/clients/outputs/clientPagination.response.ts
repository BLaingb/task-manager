import { ObjectType } from 'type-graphql';
import paginationResponse from '../../shared/outputs/pagination.response';
import { Client } from '../models/client.model';

@ObjectType()
export class ClientPagination extends paginationResponse(Client) {}
