import { config } from '@shared/components/config'
import { ServiceContext } from '@shared/interface'
import { UserRPCClient } from '@shared/rpc/user-rpc'
import { PrismaCommentLikeRepository } from './infras/repository/mysql'
import { CommentQueryRPC } from './infras/repository/rpc'
import { CommentLikeHttpService } from './infras/transport/http-service'
import { CommentLikeUseCase } from './usecase'

export const setupCommentLikeModule = (sctx: ServiceContext) => {
 const mdlFactory = sctx.mdlFactory

 const repository = new PrismaCommentLikeRepository()
 const commentQueryRpc = new CommentQueryRPC(config.rpc.commentServiceURL)
 const usecase = new CommentLikeUseCase(repository, commentQueryRpc, sctx.eventPublisher)
 const userRpc = new UserRPCClient(config.rpc.userServiceURL)

 const httpService = new CommentLikeHttpService(usecase, repository, userRpc)
 return httpService.getRoutes(mdlFactory)
}
