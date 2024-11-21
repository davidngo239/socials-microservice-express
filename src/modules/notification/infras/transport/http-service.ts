import { INotificationUseCase } from "@modules/notification/interface";
import { MdlFactory, Requester } from "@shared/interface";
import { pagingDTOSchema } from "@shared/model";
import { paginatedResponse, successResponse } from "@shared/utils/utils";
import { Request, Response, Router } from "express";

export class HttpNotificationService {
  constructor(
    private readonly useCase: INotificationUseCase,
  ) { }

  async listAPI(req: Request, res: Response) {
    const paging = pagingDTOSchema.parse(req.query);
    const { sub: userId } = res.locals.requester;

    const result = await this.useCase.list({ receiverId: userId }, paging);
    paginatedResponse(result, {}, res);
  }

  async readAPI(req: Request, res: Response) {
    const { id } = req.params;
    const requester = res.locals.requester as Requester;

    const result = await this.useCase.read(id, requester);
    successResponse(result, res);
  }

  async readAllAPI(req: Request, res: Response) {
    const requester = res.locals.requester as Requester;

    const result = await this.useCase.readAll(requester);
    successResponse(result, res);
  }

  getRoutes(mdlFactory: MdlFactory) {
    const router = Router();

    router.get('/notifications', mdlFactory.auth, this.listAPI.bind(this));
    router.post('/notifications/:id/read', mdlFactory.auth, this.readAPI.bind(this));
    router.post('/notifications/read-all', mdlFactory.auth, this.readAllAPI.bind(this));

    return router;
  }
}
