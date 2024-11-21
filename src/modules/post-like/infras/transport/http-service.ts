import { IPostLikeRepository } from '@modules/post-like/interface';
import { PostLikeUsecase } from '@modules/post-like/usecase';
import { IAuthorRpc, MdlFactory, Requester } from '@shared/interface';
import { pagingDTOSchema, PublicUser } from '@shared/model';
import Logger from '@shared/utils/logger';
import { pagingResponse, successResponse } from '@shared/utils/utils';
import { Request, Response, Router } from 'express';

export class PostLikeHttpService {
  constructor(
    private readonly usecase: PostLikeUsecase,
    private readonly repo: IPostLikeRepository,
    private readonly userRepo: IAuthorRpc
  ) { }

  async likeAPI(req: Request, res: Response) {
    const { id: postId } = req.params;
    const { sub } = res.locals.requester as Requester;

    const result = await this.usecase.like({ postId, userId: sub });

    successResponse(result, res);
  }

  async unlikeAPI(req: Request, res: Response) {
    const { id: postId } = req.params;
    const { sub } = res.locals.requester as Requester;

    const result = await this.usecase.unlike({ postId, userId: sub });

    successResponse(result, res);
  }

  async getLikesAPI(req: Request, res: Response) {
    const postId = req.params.postId;
    const paging = pagingDTOSchema.parse(req.query);

    const result = await this.repo.list(postId, paging);
    const userIds = result.data.map((item) => item.userId);
    const users = await this.userRepo.findByIds(userIds);

    const userMap: Record<string, PublicUser> = {};
    users.map((user) => {
      userMap[user.id] = user;
    });

    const finalResult = result.data.map((item) => {
      const user = userMap[item.userId];
      return { user, likedAt: item.createdAt };
    });

    pagingResponse(finalResult, paging, {}, res);
  }

  async hasLikedAPI(req: Request, res: Response) {
    try {
      const { userId, postId } = req.body;
      const result = await this.repo.get({ userId, postId });
      successResponse(result !== null, res);
    } catch (e) {
      Logger.error((e as Error).message);
      successResponse(false, res);
    }
  }

  async listPostIdsLikedAPI(req: Request, res: Response) {
    const { userId, postIds } = req.body;
    const result = await this.repo.listPostIdsLiked(userId, postIds);
    successResponse(result, res);
  }

  getRoutes(mdlFactory: MdlFactory): Router {
    const router = Router();

    router.post('/posts/:id/like', mdlFactory.auth, this.likeAPI.bind(this));
    router.delete('/posts/:id/unlike', mdlFactory.auth, this.unlikeAPI.bind(this));
    router.get('/posts/:id/liked-users', this.getLikesAPI.bind(this));

    // RPC
    router.post('/rpc/has-liked', this.hasLikedAPI.bind(this));
    router.post('/rpc/list-post-ids-liked', this.listPostIdsLikedAPI.bind(this));

    return router;
  }
}
