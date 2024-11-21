import { ITopicRepository } from '@modules/topic/interface/interface';
import { TopicUsecase } from '@modules/topic/usecase';
import { MdlFactory } from '@shared/interface';
import { pagingDTOSchema } from "@shared/model";
import { ErrNotFound } from '@shared/utils/error';
import { paginatedResponse, successResponse } from '@shared/utils/utils';
import { NextFunction, Request, Response, Router } from 'express';


export class TopicHttpService {
  constructor(
    private readonly usecase: TopicUsecase,
    private readonly topicRepo: ITopicRepository,
  ) { }

  async createTopicAPI(req: Request, res: Response) {
    const data = await this.usecase.create(req.body);
    successResponse(data, res);
  }

  async updateTopicAPI(req: any, res: any) {
    const { id } = req.params;
    const data = await this.usecase.update(id, req.body);
    successResponse(data, res);
  }

  async deleteTopicAPI(req: any, res: any) {
    const { id } = req.params;
    const data = await this.usecase.delete(id);
    successResponse(data, res);
  }

  async listTopicsAPI(req: Request, res: Response) {
    const paging = pagingDTOSchema.parse(req.query);
    const dto = req.query;

    const data = await this.usecase.list(dto, paging);
    paginatedResponse(data, {}, res);
  }

  // RPC APIs

  async listByIdsAPI(req: Request, res: Response) {
    const { ids } = req.body;
    const data = await this.topicRepo.findByIds(ids);

    res.status(200).json({ data });
  }

  async getByIdAPI(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const data = await this.topicRepo.findByIds([id]);

    if (data.length === 0) {
      next(ErrNotFound);
      return;
    }

    res.status(200).json({ data: data[0] });
  }


  getRoutes(mdlFactory: MdlFactory): Router {
    const router = Router();

    router.post('/topics', mdlFactory.auth, this.createTopicAPI.bind(this));
    router.patch('/topics/:id', mdlFactory.auth, this.updateTopicAPI.bind(this));
    router.delete('/topics/:id', mdlFactory.auth, this.deleteTopicAPI.bind(this));
    router.get('/topics', this.listTopicsAPI.bind(this));

    // RPC APIs
    router.post('/rpc/topics/list-by-ids', this.listByIdsAPI.bind(this));
    router.get('/rpc/topics/:id', this.getByIdAPI.bind(this));

    return router;
  }

}