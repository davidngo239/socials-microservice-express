import { IPostLikedRPC, IPostRepository, IPostSavedRPC, IPostUseCase, ITopicQueryRPC } from "@modules/post/interfaces";
import { Post, postCondDTOSchema } from "@modules/post/model";
import { IAuthorRpc, MdlFactory, Requester } from "@shared/interface";
import { pagingDTOSchema, PublicUser, Topic } from "@shared/model";
import { ErrNotFound } from "@shared/utils/error";
import { paginatedResponse, successResponse } from "@shared/utils/utils";
import { NextFunction, Request, Response, Router } from "express";

export class PostHttpService {
  constructor(
    private readonly useCase: IPostUseCase,
    private readonly repo: IPostRepository,
    private readonly userRPC: IAuthorRpc,
    private readonly ITopicQueryRPC: ITopicQueryRPC,
    private readonly postLikeRPC: IPostLikedRPC,
    private readonly postSavedRPC: IPostSavedRPC,
  ) { }

  async createPostAPI(req: Request, res: Response) {
    const requester = res.locals.requester as Requester;

    const dto = { ...req.body, authorId: requester.sub };

    const data = await this.useCase.create(dto);
    res.status(201).json({ data });
  }

  async listPostAPI(req: Request, res: Response) {
    const paging = pagingDTOSchema.parse(req.query);
    const dto = postCondDTOSchema.parse(req.query);

    const result = await this.repo.list(dto, paging);

    const topicIds = result.data.map((item) => item.topicId);
    const authorIds = result.data.map((item) => item.authorId);
    const postIds = result.data.map((item) => item.id);

    const postLikeMap: Record<string, boolean> = {};
    const postSavedMap: Record<string, boolean> = {};

    if (res.locals.requester) {
      // when logged in
      const userId = res.locals.requester.sub;
      const postLikedIds = await this.postLikeRPC.listPostIdsLiked(userId, postIds);
      postLikedIds.forEach((item) => {
        postLikeMap[item] = true;
      });

      const postSavedIds = await this.postSavedRPC.listPostIdsSaved(userId, postIds);
      postSavedIds.forEach((item) => {
        postSavedMap[item] = true;
      });
    }

    const topics = await this.ITopicQueryRPC.findByIds(topicIds);
    const users = await this.userRPC.findByIds(authorIds);

    const authorMap: Record<string, PublicUser> = {};
    const topicMap: Record<string, Topic> = {};


    users.forEach((u: PublicUser) => {
      authorMap[u.id] = u;
    });

    topics.forEach((t: Topic) => {
      topicMap[t.id] = t;
    });

    result.data = result.data.map((item) => {
      const topic = topicMap[item.topicId];
      const user = authorMap[item.authorId];

      return { ...item, topic, author: user, hasLiked: postLikeMap[item.id] === true, hasSaved: postSavedMap[item.id] === true } as Post;
    });

    paginatedResponse(result, dto, res);
  }

  async getPostAPI(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const result = await this.repo.get(id);

    if (!result) {
      next(ErrNotFound);
      return;
    }

    const author = await this.userRPC.findById(result.authorId);
    const topic = await this.ITopicQueryRPC.findById(result.topicId);

    const { authorId, topicId, ...rest } = result;

    let hasLiked = false;
    let hasSaved = false;

    if (res.locals.requester) {
      const userId = res.locals.requester.sub;
      hasLiked = await this.postLikeRPC.hasLikedId(userId, result.id);
      hasSaved = await this.postSavedRPC.hasSavedId(userId, result.id);
    }

    const data = { ...rest, topic, author, hasLiked, hasSaved };

    successResponse(data, res);
  }

  async updatePostAPI(req: Request, res: Response) {
    const requester = res.locals.requester as Requester;
    const { id } = req.params;

    const result = await this.useCase.update(id, req.body, requester);

    successResponse(result, res);
  }

  async deletePostAPI(req: Request, res: Response) {
    const requester = res.locals.requester as Requester;
    const { id } = req.params;

    const result = await this.useCase.delete(id, requester);

    successResponse(result, res);
  }

  // RPC API (use internally)
  async listPostByIdsAPI(req: Request, res: Response) {
    const { ids } = req.body;

    const result = await this.repo.listByIds(ids);

    successResponse(result, res);
  }

  async getByIdAPI(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const data = await this.repo.listByIds([id]);

    if (data.length === 0) {
      next(ErrNotFound);
      return;
    }

    res.status(200).json({ data: data[0] });
  }


  getRoutes(mdlFactory: MdlFactory): Router {
    const router = Router();

    router.post('/posts', mdlFactory.auth, this.createPostAPI.bind(this));
    router.get('/posts', mdlFactory.optAuth, this.listPostAPI.bind(this));
    router.get('/posts/:id', mdlFactory.optAuth, this.getPostAPI.bind(this));
    router.patch('/posts/:id', mdlFactory.auth, this.updatePostAPI.bind(this));
    router.delete('/posts/:id', mdlFactory.auth, this.deletePostAPI.bind(this));

    // RPC API (use internally)
    router.post('/rpc/posts/list-by-ids', this.listPostByIdsAPI.bind(this));
    router.get('/rpc/posts/:id', this.getByIdAPI.bind(this));

    return router;
  }
}