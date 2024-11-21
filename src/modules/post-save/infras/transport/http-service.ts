import { IPostSaveRepository, IPostSaveUseCase, ITopicQueryRPC } from "@modules/post-save/interface";
import { Topic } from "@modules/post-save/model/topic";
import { IAuthorRpc, IPostRpc, MdlFactory, Requester } from "@shared/interface";
import { pagingDTOSchema, Post, PublicUser } from "@shared/model";
import Logger from "@shared/utils/logger";
import { paginatedResponse, successResponse } from "@shared/utils/utils";
import { log } from "console";
import { Request, Response, Router } from "express";


export class PostSaveHttpService {
  constructor(
    private readonly usecase: IPostSaveUseCase,
    private readonly repo: IPostSaveRepository,
    private readonly postRpc: IPostRpc,
    private readonly userRPC: IAuthorRpc,
    private readonly topicQueryRPC: ITopicQueryRPC,
  ) { }

  async saveAPI(req: Request, res: Response) {
    const { sub } = res.locals.requester as Requester;

    const dto = {
      postId: req.params.id,
      userId: sub
    };

    const result = await this.usecase.save(dto);

    successResponse(result, res);
  }

  async unsaveAPI(req: Request, res: Response) {
    const { sub } = res.locals.requester as Requester;

    const dto = {
      postId: req.params.id,
      userId: sub
    };

    const result = await this.usecase.unsave(dto);

    successResponse(result, res);
  }

  async listPostSaveAPI(req: Request, res: Response) {
    // const { sub } = res.locals.requester as Requester;
    const userId = req.params.id;
    const paging = pagingDTOSchema.parse(req.query);

    const postUserSave = await this.repo.list(userId, paging);

    const postIds = postUserSave.data.map(item => item.postId);
    const posts = await this.postRpc.findByIds(postIds);
    
    const authorMap: Record<string, PublicUser> = {};
    const postMap: Record<string, Post> = {};
    const topicMap: Record<string, Topic> = {};

    let topicIds: string[] = [];
    let authorIds: string[] = [];

    posts.forEach((p: Post) => {
      postMap[p.id] = p;
      topicIds.push(p.topicId);
      authorIds.push(p.authorId);
    });

    const authors = await this.userRPC.findByIds(authorIds);

    authors.forEach((au: PublicUser) => {
      authorMap[au.id] = au;
    });

    const topics = await this.topicQueryRPC.findByIds(topicIds);

    topics.forEach((t: Topic) => {
      topicMap[t.id] = t;
    });

    const listPosts = postUserSave.data.map(item => {
      const post = postMap[item.postId];
      const author = authorMap[post.authorId];
      const topic = topicMap[post.topicId];

      return {
        ...post,
        author,
        topic,
        hasSaved: true,
        createdAt: item.createdAt
      };
    })

    const pagingResult = {
      paging,
      total: postUserSave.total,
      data: listPosts
    };

    paginatedResponse(pagingResult, {}, res);
  }

  async hasSavedAPI(req: Request, res: Response) {
    try {
      const { userId, postId } = req.body;
      const result = await this.repo.get({ userId, postId });
      successResponse(result !== null, res);
    } catch (e) {
      Logger.error((e as Error).message);
      successResponse(false, res);
    }
  }

  async listPostIdsSavedAPI(req: Request, res: Response) {
    const { userId, postIds } = req.body;
    const result = await this.repo.listPostIdsSaved(userId, postIds);
    successResponse(result, res);
  }

  getRoutes(mdlFactory: MdlFactory): Router {
    const router = Router();

    router.post("/posts/:id/save", mdlFactory.auth, this.saveAPI.bind(this));
    router.post("/posts/:id/unsave", mdlFactory.auth, this.unsaveAPI.bind(this));
    router.get("/users/:id/saved-posts", mdlFactory.auth, this.listPostSaveAPI.bind(this));

    // RPC
    router.post("/rpc/has-saved", this.hasSavedAPI.bind(this));
    router.post("/rpc/list-post-ids-saved", this.listPostIdsSavedAPI.bind(this));

    return router;
  }
}
