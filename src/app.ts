import 'compression';
import cors from 'cors';
import express, { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import helmet from 'helmet';

function buildApp(): Application {
  const app: Application = express();

  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(helmet());
  app.use(cors({ origin: '*' }));
  app.set('trust proxy', 1);

  app.use('/ping', (_: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      message: 'pong'
    });
  });

  return app;
}

export default buildApp();
