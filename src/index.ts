import 'module-alias/register';

import { setupCommentLikeModule } from '@modules/comment-like/module';
import { setupCommentModule, setupCommentRedisConsumer } from '@modules/comment/module';
import { setupFollowingModule } from '@modules/following/module';
import { setupMediaModule } from '@modules/media/module';
import { setupNotificationConsumer, setupNotificationModule } from '@modules/notification/module';
import { setupPostLikeModule } from '@modules/post-like/module';
import { setupPostSaveModule } from '@modules/post-save/module';
import { setupPostModule, setupPostRedisConsumer } from '@modules/post/module';
import { setupTopicModule, setupTopicRedisConsumer } from '@modules/topic/module';
import { setupUserConsumer, setupUserModule } from '@modules/user/module';
import { config } from '@shared/components/config';
import prisma from '@shared/components/prisma';
import { RedisClient } from '@shared/components/redis-pubsub/redis';
import { ServiceContext } from '@shared/interface';
import { TokenIntrospectRPCClient } from '@shared/rpc/verify-token';
import { responseErr } from '@shared/utils/error';
import Logger from '@shared/utils/logger';
import { NextFunction, Request, Response, static as serveStatic } from 'express';
import { createServer } from 'http';
import path from 'path';
import app from './app';
import { setupMiddlewares } from './shared/middleware/index';

async function bootServer(port: number) {
  Logger.info(`Starting server in ${config.envName} mode...`);

  try {
    const introspector = new TokenIntrospectRPCClient(config.rpc.introspectUrl);
    const MdlFactory = setupMiddlewares(introspector);

    const connectionUrl = config.redis.url as string;
    await RedisClient.init(connectionUrl);

    await prisma.$connect();
    Logger.success('Prisma connected to database');

    // error handling
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      responseErr(err, res);
      return next();
    });

    const serviceCtx: ServiceContext = {
      mdlFactory: MdlFactory,
      eventPublisher: RedisClient.getInstance(),
    };

    const userModule = setupUserModule(serviceCtx);
    const commentModule = setupCommentModule(serviceCtx);
    const commentLikeModule = setupCommentLikeModule(serviceCtx);
    const postModule = setupPostModule(serviceCtx);
    const postSaveModule = setupPostSaveModule(serviceCtx);
    const postLikeModule = setupPostLikeModule(serviceCtx);
    const topicModule = setupTopicModule(serviceCtx);
    const followingModule = setupFollowingModule(serviceCtx);
    const mediaModule = setupMediaModule();
    const notificationModule = setupNotificationModule(serviceCtx);

    app.use('/v1', userModule);
    app.use('/v1', commentModule);
    app.use('/v1', commentLikeModule);
    app.use('/v1', postModule);
    app.use('/v1', postLikeModule);
    app.use('/v1', followingModule);
    app.use('/v1', postSaveModule);
    app.use('/v1', topicModule);
    app.use('/v1', mediaModule);
    app.use('/v1', notificationModule);

    app.use('/uploads', serveStatic(path.join(__dirname, '../uploads')));

    // error handling
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      responseErr(err, res);
      return next();
    });

    // setup redis consumer
    setupPostRedisConsumer(serviceCtx);
    setupTopicRedisConsumer(serviceCtx);
    setupCommentRedisConsumer(serviceCtx);
    setupUserConsumer(serviceCtx);
    setupNotificationConsumer(serviceCtx);

    const server = createServer(app);

    server.listen(port, () => {
      Logger.success(`Server is running on port ${port}`);
    });
  } catch (e) {
    Logger.error(`Failed to start server: ${(e as Error).message}`);
    process.exit(1);
  }
}

const port = parseInt(config.port);
bootServer(port);
