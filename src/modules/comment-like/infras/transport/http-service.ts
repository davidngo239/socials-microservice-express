import { IRepository } from "@modules/comment-like/interface";
import { CommentLikeUseCase } from "@modules/comment-like/usecase";
import { IAuthorRpc, MdlFactory, Requester } from "@shared/interface";
import { pagingDTOSchema, PublicUser } from "@shared/model";
import { paginatedResponse, successResponse } from "@shared/utils/utils";
import { Request, Response, Router } from "express";

export class CommentLikeHttpService {
  constructor(
    private readonly usecase: CommentLikeUseCase,
    private readonly repo: IRepository,
    private readonly userRepo: IAuthorRpc,
  ) { }

  async likeAPI(req: Request, res: Response) {
    const { sub } = res.locals.requester as Requester;

    const dto = {
      commentId: req.params.id,
      userId: sub
    };

    const result = await this.usecase.like(dto);

    successResponse(result, res);
  }

  async unlikeAPI(req: Request, res: Response) {
    const { sub } = res.locals.requester as Requester;

    const dto = {
      commentId: req.params.id,
      userId: sub
    };

    const result = await this.usecase.unlike(dto);

    successResponse(result, res);
  }

  async listUsersAPI(req: Request, res: Response) {
    const { id: commentId } = req.params;
    const paging = pagingDTOSchema.parse(req.query);

    const result = await this.repo.list(commentId, paging);

    const userIds = result.data.map(item => item.userId);

    const users = await this.userRepo.findByIds(userIds);

    const userMap: Record<string, PublicUser> = {};

    users.forEach(user => {
      userMap[user.id] = user;
    });

    const finalResult = result.data.map(item => {
      const user = userMap[item.userId];
      return { user, likedAt: item.createdAt };
    });

    const pagingResult = {
      paging,
      total: result.total,
      data: finalResult
    };

    paginatedResponse(pagingResult, {}, res);
  }

  getRoutes(mdlFactory: MdlFactory): Router {
    const router = Router();

    router.post("/comments/:id/like", mdlFactory.auth, this.likeAPI.bind(this));
    router.post("/comments/:id/unlike", mdlFactory.auth, this.unlikeAPI.bind(this));
    router.get("/comments/:id/liked-users", mdlFactory.auth, this.listUsersAPI.bind(this));
    return router;
  }
}
