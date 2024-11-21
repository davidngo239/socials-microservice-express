import { config } from "@shared/components/config";
import { ServiceContext } from "@shared/interface";
import { PostRPCClient } from "@shared/rpc/post-rpc";
import { UserRPCClient } from "@shared/rpc/user-rpc";
import { MysqlNotificationRepository } from "./infras/repository/mysql";
import { HttpNotificationService } from "./infras/transport/http-service";
import { RedisNotificationConsumer } from "./infras/transport/redis-consumer";
import { NotificationUseCase } from "./usecase";

export const setupNotificationModule = (sctx: ServiceContext) => {
  const repository = new MysqlNotificationRepository();
  const userRpc = new UserRPCClient(config.rpc.userServiceURL);

  const usecase = new NotificationUseCase(repository, userRpc);
  const httpService = new HttpNotificationService(usecase);

  return httpService.getRoutes(sctx.mdlFactory);
};

export const setupNotificationConsumer = (sctx: ServiceContext) => {
  const repository = new MysqlNotificationRepository();
  const userRpc = new UserRPCClient(config.rpc.userServiceURL);
  const postRpc = new PostRPCClient(config.rpc.postServiceURL);

  const usecase = new NotificationUseCase(repository, userRpc);
  const consumer = new RedisNotificationConsumer(usecase, userRpc, postRpc);
  consumer.subscribe();
};
