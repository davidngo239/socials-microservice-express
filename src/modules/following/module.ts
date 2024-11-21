import { ServiceContext } from "@shared/interface";
import { MysqlFollowingRepository } from "./infras/repository/mysql";
import { UserRPCClient } from "@shared/rpc/user-rpc";
import { config } from "@shared/components/config";
import { FollowingUsecase } from "./usecase";
import { FollowingHttpService } from "./infras/transport/http-service";

export const setupFollowingModule = (sctx: ServiceContext) => {
  const mdlFactory = sctx.mdlFactory;
  
  const repository = new MysqlFollowingRepository();
  const userRpc = new UserRPCClient(config.rpc.userServiceURL);
  const usecase = new FollowingUsecase(repository, userRpc, sctx.eventPublisher);
  const httpService = new FollowingHttpService(usecase);

  return httpService.getRoutes(mdlFactory);
}
