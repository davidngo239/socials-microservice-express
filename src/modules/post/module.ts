import { config } from "@shared/components/config";
import { ServiceContext } from "@shared/interface";
import { UserRPCClient } from "@shared/rpc/user-rpc";
import { MysqlPostRepository } from "./infras/repository/mysql";
import { PostLikedRPC, PostSavedRPC, TopicQueryRPC } from "./infras/repository/rpc";
import { PostHttpService } from "./infras/transport/http-service";
import { RedisPostConsumer } from "./infras/transport/redis-consumer";
import { PostUsecase } from "./usecase";

export const setupPostModule = (sctx: ServiceContext) => {
  const mdlFactory = sctx.mdlFactory;

  const repository = new MysqlPostRepository();

  const authRPC = new UserRPCClient(config.rpc.userServiceURL);
  const topicRPC = new TopicQueryRPC(config.rpc.topicServiceURL);
  const usecase = new PostUsecase(repository, topicRPC, authRPC, sctx.eventPublisher);
  const postLikeRPC = new PostLikedRPC(config.rpc.postLikeServiceURL);
  const postSavedRPC = new PostSavedRPC(config.rpc.postSavedServiceURL);
  const httpService = new PostHttpService(usecase, repository, authRPC, topicRPC, postLikeRPC, postSavedRPC);

  return httpService.getRoutes(mdlFactory);
};

export const setupPostRedisConsumer = (sctx: ServiceContext) => {
  const repository = new MysqlPostRepository();
  const redisConsumer = new RedisPostConsumer(repository);
  redisConsumer.subscribe();
};
