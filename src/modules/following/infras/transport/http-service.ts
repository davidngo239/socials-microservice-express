import { FollowingUsecase } from '@modules/following/usecase';
import { MdlFactory, Requester } from '@shared/interface';
import { pagingDTOSchema } from '@shared/model';
import { paginatedResponse, successResponse } from '@shared/utils/utils';
import { Request, Response, Router } from 'express';

export class FollowingHttpService {
  constructor(private readonly usecase: FollowingUsecase) { }

  async hasFollowedAPI(req: Request, res: Response) {
    const { sub } = res.locals.requester as Requester;
    const { id: followingId } = req.params;
    const result = await this.usecase.hasFollowed(sub, followingId);
    successResponse(result, res);
  }

  async followAPI(req: Request, res: Response) {
    const { sub } = res.locals.requester as Requester;

    const dto = {
      followerId: sub,
      followingId: req.params.id
    };
    const result = await this.usecase.follow(dto);

    successResponse(result, res);
  }

  async unfollowAPI(req: Request, res: Response) {
    const { sub } = res.locals.requester as Requester;

    const dto = {
      followerId: sub,
      followingId: req.params.id
    };

    const result = await this.usecase.unfollow(dto);

    successResponse(result, res);
  }

  async listFollowersAPI(req: Request, res: Response) {
    const { id: followingId } = req.params;

    const paging = pagingDTOSchema.parse(req.query);

    const result = await this.usecase.listFollowers(followingId, paging);

    paginatedResponse(result, { followingId }, res);
  }

  async listFollowingsAPI(req: Request, res: Response) {
    const { id: followerId } = req.params;

    const paging = pagingDTOSchema.parse(req.query);

    const result = await this.usecase.listFollowings(followerId, paging);

    paginatedResponse(result, { followerId }, res);
  }

  getRoutes(mdlFactory: MdlFactory) {
    const router = Router();

    router.post('/users/:id/follow', mdlFactory.auth, this.followAPI.bind(this));
    router.delete('/users/:id/unfollow', mdlFactory.auth, this.unfollowAPI.bind(this));
    router.get('/users/:id/followers', mdlFactory.auth, this.listFollowersAPI.bind(this));
    router.get('/users/:id/followings', mdlFactory.auth, this.listFollowingsAPI.bind(this));
    router.get('/users/:id/has-followed', mdlFactory.auth, this.hasFollowedAPI.bind(this));
    return router;
  }
}
