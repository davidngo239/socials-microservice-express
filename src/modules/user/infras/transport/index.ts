import { IUserUseCase } from '@modules/user/interface';
import { User, UserCondDTO, UserRegistrationDTO, UserUpdateDTO } from '@modules/user/model';
import { jwtProvider } from '@shared/components/jwt';
import { Requester } from '@shared/interface';
import { BaseHttpService } from '@shared/transport/base-http-service';
import { ErrNotFound, ErrUnauthorized } from '@shared/utils/error';
import { successResponse } from '@shared/utils/utils';
import { NextFunction, Request, Response } from 'express';

export class UserHTTPService extends BaseHttpService<User, UserRegistrationDTO, UserUpdateDTO, UserCondDTO> {
  constructor(readonly usecase: IUserUseCase) {
    super(usecase);
  }

  async registerAPI(req: Request, res: Response) {
    await this.createAPI(req, res);
  }

  async loginAPI(req: Request, res: Response) {
    const token = await this.usecase.login(req.body);
    res.status(200).json({ data: token });
  }

  async profileAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);

    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const { sub } = payload;

    const user = await this.usecase.profile(sub);

    const { salt, password, ...otherProps } = user;
    successResponse(otherProps, res);
  }

  async updateProfileAPI(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrUnauthorized.withMessage('Access token is missing');
    }

    const payload = await jwtProvider.verifyToken(token);

    if (!payload) {
      throw ErrUnauthorized.withMessage('Invalid access token');
    }

    const requester = payload as Requester;

    await this.usecase.updateProfile(requester, req.body);

    successResponse(true, res);
  }

  async introspectAPI(req: Request, res: Response) {
    const { token } = req.body;
    const result = await this.usecase.verifyToken(token);
    successResponse(result, res);
  }

  async getDetailAPI(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.usecase.getDetail(id);

    if (!result) {
      throw ErrNotFound;
    }

    const { salt, password, ...otherProps } = result;
    successResponse(otherProps, res);
  }

  // RPC API
  async getByIdAPI(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const data = await this.usecase.listByIds([id]);

    if (data.length === 0) {
      throw ErrNotFound;
    }

    const { salt, password, ...otherProps } = data[0];
    successResponse(otherProps, res);
  }

  async listByIdsAPI(req: Request, res: Response) {
    const { ids } = req.body;
    const data = await this.usecase.listByIds(ids);

    const finalData = data.map(({ salt, password, ...otherProps }) => otherProps);
    successResponse(finalData, res);
  }
}
