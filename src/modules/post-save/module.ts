import { config } from "@shared/components/config";
import { ServiceContext } from "@shared/interface";
import { PostRPCClient } from "@shared/rpc/post-rpc";
import { PrismaPostSaveRepository } from "./infras/repository/mysql";
import { PostSaveHttpService } from "./infras/transport/http-service";
import { PostSaveUseCase } from "./usecase";
import { UserRPCClient } from "@shared/rpc/user-rpc";
import { TopicQueryRPC } from "./infras/repository/rpc";


export const setupPostSaveModule = (sctx: ServiceContext) => {
  const mdlFactory = sctx.mdlFactory;

  const repository = new PrismaPostSaveRepository();
  const postRpc = new PostRPCClient(config.rpc.postServiceURL);
  const userRpc = new UserRPCClient(config.rpc.userServiceURL);
  const topicRpc = new TopicQueryRPC(config.rpc.topicServiceURL);
  const usecase = new PostSaveUseCase(repository, postRpc);
  
  const httpService = new PostSaveHttpService(usecase, repository, postRpc, userRpc, topicRpc);
  return httpService.getRoutes(mdlFactory);
}
