import { IEventPublisher } from '@shared/components/redis-pubsub/interface';
import { Paginated, PagingDTO, Post, PublicUser, Topic } from '@shared/model';
import { Handler } from 'express';

export interface IUseCase<CreateDTO, UpdateDTO, Entity, Cond> {
  create(data: CreateDTO): Promise<string>;
  getDetail(id: string): Promise<Entity | null>;
  list(cond: Cond, paging: PagingDTO): Promise<Paginated<Entity>>;
  update(id: string, data: UpdateDTO): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export interface IRepository<Entity, Cond, UpdateDTO> extends IQueryRepository<Entity, Cond>, ICommandRepository<Entity, UpdateDTO> { }

export interface ICommandRepository<Entity, UpdateDTO> {
  insert(data: Entity): Promise<boolean>;
  update(id: string, data: UpdateDTO): Promise<boolean>;
  delete(data: any, isHard: boolean): Promise<boolean>;
}
export interface IQueryRepository<Entity, CondDTO> {
  findById(id: string): Promise<Entity | null>;
  findByCond(condition: CondDTO): Promise<Entity | null>;
  list(cond: CondDTO, paging: PagingDTO): Promise<Paginated<Entity>>;
  listByIds(ids: string[]): Promise<Array<Entity>>;
}

export interface TokenPayload {
  sub: string;
  role: UserRole;
}

export interface Requester extends TokenPayload { }

export interface ITokenProvider {
  // generate access token
  generateToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload | null>;
}

export interface ICommandHandler<Command, Result> {
  execute(command: Command): Promise<Result>;
}
export interface IQueryHandler<Query, Result> {
  query(query: Query): Promise<Result>;
}

export type TokenIntrospectResult = {
  payload: TokenPayload | null;
  error?: Error;
  isOk: boolean;
};
export interface ITokenIntrospect {
  introspect(token: string): Promise<TokenIntrospectResult>;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface MdlFactory {
  auth: Handler;
  optAuth: Handler;
  allowRoles: (roles: UserRole[]) => Handler;
}

export type ServiceContext = {
  mdlFactory: MdlFactory;
  eventPublisher: IEventPublisher;
};


export interface IPostRpc {
  findById(id: string): Promise<Post | null>;
  findByIds(ids: Array<string>): Promise<Array<Post>>;
}
export interface IAuthorRpc {
  findById(id: string): Promise<PublicUser | null>;
  findByIds(ids: Array<string>): Promise<Array<PublicUser>>;
}

export interface ITopicRPC {
  findById(id: string): Promise<Topic | null>;
  findAll(): Promise<Array<Topic>>;
}

export interface IPublicUserRpc extends IAuthorRpc { }
