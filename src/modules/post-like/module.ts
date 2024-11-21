import { config } from "@shared/components/config";
import { ServiceContext } from "@shared/interface";
import { UserRPCClient } from "@shared/rpc/user-rpc";
import { MysqlPostLikeRepository } from "./infras/repository/mysql";
import { PostQueryRPC } from "./infras/repository/rpc";
import { PostLikeHttpService } from "./infras/transport/http-service";
import { PostLikeUsecase } from "./usecase";

export const setupPostLikeModule = (sctx: ServiceContext) => {
  const mdlFactory = sctx.mdlFactory;

  const repository = new MysqlPostLikeRepository();
  const postQueryRpc = new PostQueryRPC(config.rpc.postServiceURL);
  const usecase = new PostLikeUsecase(repository, postQueryRpc, sctx.eventPublisher);
  const userRpc = new UserRPCClient(config.rpc.userServiceURL);

  const httpService = new PostLikeHttpService(usecase, repository, userRpc);
  return httpService.getRoutes(mdlFactory);
};