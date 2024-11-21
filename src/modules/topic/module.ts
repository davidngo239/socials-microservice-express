import { ServiceContext } from "@shared/interface";
import { PrismaTopicRepository } from "./infras/repository";
import { TopicHttpService } from "./infras/transport/http-service";
import { RedisTopicConsumer } from "./infras/transport/redis-consumer";
import { TopicUsecase } from "./usecase";

export const setupTopicModule = (sctx: ServiceContext) => {
  const mdlFactory = sctx.mdlFactory;

  const repo = new PrismaTopicRepository();
  const usecase = new TopicUsecase(repo);

  const httpService = new TopicHttpService(usecase, repo);
  const router = httpService.getRoutes(mdlFactory);

  return router;
}


export const setupTopicRedisConsumer = (sctx: ServiceContext) => {
  const repo = new PrismaTopicRepository();
  const redisConsumer = new RedisTopicConsumer(repo);
  redisConsumer.subcriber();
}
