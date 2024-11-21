import { config } from '@shared/components/config';
import prisma from '@shared/components/prisma';
import { ServiceContext } from '@shared/interface';
import { PostRPCClient } from '@shared/rpc/post-rpc';
import { Router } from 'express';
import { MysqlCommentRepository } from './infras/repository/mysql';
import { CommentHttpService } from './infras/transport/http-service';
import { CommentUsecase } from './usecase/comment';
import { UserRPCClient } from '@shared/rpc/user-rpc';
import { RedisCommentConsumer } from './infras/transport/redis-consumer';

export const setupCommentModule = (sctx: ServiceContext) => {
 const mdlFactory = sctx.mdlFactory

 const repository = new MysqlCommentRepository()
 const userRepo = new UserRPCClient(config.rpc.userServiceURL)

 const postRepo = new PostRPCClient(config.rpc.postServiceURL)
 const usecase = new CommentUsecase(repository, postRepo, userRepo, sctx.eventPublisher)

 const httpService = new CommentHttpService(usecase)

 return httpService.getRoutes(mdlFactory);
}

export const setupCommentRedisConsumer = (sctx: ServiceContext) => {
  const repository = new MysqlCommentRepository();
  const redisConsumer = new RedisCommentConsumer(repository);
  redisConsumer.subscribe();
};
