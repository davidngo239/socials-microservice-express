import { CommentCondDTO, commentCondDTOSchema, CommentUpdateDTO } from '@modules/comment/model/dto';
import { ICommentUseCase } from '@modules/comment/model/interface';
import { MdlFactory, Requester } from '@shared/interface';
import { pagingDTOSchema } from '@shared/model';
import { paginatedResponse, successResponse } from '@shared/utils/utils';
import { Request, Response, Router } from 'express';

export class CommentHttpService {
  constructor(private readonly useCase: ICommentUseCase) { }

  async listCommentAPI(req: Request, res: Response) {
    const dto: CommentCondDTO = { postId: req.params.id, ...req.query };

    const cond = commentCondDTOSchema.parse(dto);
    const paging = pagingDTOSchema.parse(req.query);
    const data = await this.useCase.list(cond, paging);

    paginatedResponse(data, cond, res);
  }

  async createCommentAPI(req: Request, res: Response) {
    const { id } = req.params;

    const requester = res.locals.requester as Requester;

    const dto = { ...req.body, userId: requester.sub, postId: id };

    const data = await this.useCase.create(dto);
    successResponse(data, res);
  }

  async updateCommentAPI(req: Request, res: Response) {
    const { id } = req.params;
    const { content } = req.body;

    const requester = res.locals.requester as Requester;

    const dto: CommentUpdateDTO = {
      content
    };
    const data = await this.useCase.update(id, requester, dto);
    successResponse(data, res);
  }

  async deleteCommentAPI(req: Request, res: Response) {
    const { id } = req.params;

    const requester = res.locals.requester as Requester;

    const ok = await this.useCase.delete(requester, id);

    successResponse(ok, res);
  }

  getRoutes(mdlFactory: MdlFactory): Router {
    const router = Router();

    router.get('/comments/:id/replies', this.listCommentAPI.bind(this));
    router.post('/posts/:id/comments', mdlFactory.auth, this.createCommentAPI.bind(this));
    router.patch('/comments/:id', mdlFactory.auth, this.updateCommentAPI.bind(this));
    router.delete('/comments/:id', mdlFactory.auth, this.deleteCommentAPI.bind(this));
    return router;
  }
}
