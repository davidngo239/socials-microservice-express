import { ServiceContext, UserRole } from '@shared/interface';
import { Router } from 'express';

import { PrismaUserCommandRepository, PrismaUserQueryRepository, PrismaUserRepository } from './infras/repository';
import { UserHTTPService } from './infras/transport';
import { UserUseCase } from './usecase';
import { RedisUserConsumer } from './infras/transport/redis-consumer';

export const setupUserModule = (sctx: ServiceContext) => {
  const queryRepository = new PrismaUserQueryRepository();
  const commandRepository = new PrismaUserCommandRepository();

  const repository = new PrismaUserRepository(queryRepository, commandRepository);
  const useCase = new UserUseCase(repository);
  const httpService = new UserHTTPService(useCase);

  const router = Router();
  const mdlFactory = sctx.mdlFactory;
  const adminChecker = mdlFactory.allowRoles([UserRole.ADMIN]);

  router.post('/register', httpService.registerAPI.bind(httpService));
  router.post('/authenticate', httpService.loginAPI.bind(httpService));
  router.get('/profile', httpService.profileAPI.bind(httpService));
  router.patch('/profile', httpService.updateProfileAPI.bind(httpService));

  router.post('/users', mdlFactory.auth, adminChecker, httpService.createAPI.bind(httpService));
  router.get('/users/:id', httpService.getDetailAPI.bind(httpService));
  router.get('/users', httpService.listAPI.bind(httpService));
  router.patch('/users/:id', mdlFactory.auth, adminChecker, httpService.updateAPI.bind(httpService));
  router.delete('/users/:id', mdlFactory.auth, adminChecker, httpService.deleteAPI.bind(httpService));

  // RPC API (use internally)
  router.post('/rpc/introspect', httpService.introspectAPI.bind(httpService));
  router.post('/rpc/users/list-by-ids', httpService.listByIdsAPI.bind(httpService));
  router.get('/rpc/users/:id', httpService.getByIdAPI.bind(httpService));
  return router;
};

export const setupUserConsumer = (sctx: ServiceContext) => {
  const commandRepository = new PrismaUserCommandRepository();
  const consumer = new RedisUserConsumer(commandRepository);
  consumer.subscribe();
};
