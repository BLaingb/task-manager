import { Arg, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { PaginationInput } from '../../shared/inputs/pagination.input';
import { GenericResolver } from '../../shared/resolvers/generic.resolver';
import { User } from '../../users/models/user.model';
import { ClientInput } from '../inputs/client.input';
import { Client } from '../models/client.model';
import { ClientResponse } from '../outputs/client.response';
import { ClientPagination } from '../outputs/clientPagination.response';

@Resolver(of => Client)
export class ClientResolver extends GenericResolver<Client> {
  protected className = 'Client';
  protected repository = Client.getRepository();

  @FieldResolver()
  public async user(@Root() parent: Client): Promise<User> {
    const client = await Client.findOne(parent.id, { select: ['id', 'user'], relations: ['user'] });
    if (!client) throw new Error('Client does not have a user');
    return client.user;
  }

  @Query(() => ClientPagination)
  public async clients(@Arg('paginationInput') paginationInput: PaginationInput): Promise<ClientPagination> {
    return this.findPaginated(paginationInput);
  }

  @Query(() => Client, { nullable: true })
  public async client(@Arg('id') id: string): Promise<Client | undefined> {
    return Client.findOne(id);
  }

  // @Authorized(['client:create'])
  @Mutation(() => ClientResponse)
  public async createClient(@Arg('clientInput') clientInput: ClientInput): Promise<ClientResponse> {
    return this.createOne(
      { ...clientInput, user: undefined },
      {
        relations: [{ key: 'user', id: clientInput.userId, tableName: 'user' }]
      }
    );
  }
}
