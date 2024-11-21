import { ITokenIntrospect, Requester } from "@shared/interface";
import { ErrTokenInvalid } from "@shared/utils/error";
import { Handler, NextFunction, Request, Response } from "express";

export function authMiddleware(
  introspector: ITokenIntrospect,
): Handler {
  return async (req: Request, res: Response, next: NextFunction) => {

    // 1. Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw ErrTokenInvalid.withLog('Token is missing');
    }

    // 2. Introspect token
    const { payload, error, isOk } = await introspector.introspect(token);

    if (!isOk) {
      throw ErrTokenInvalid.withLog('Token parse failed').withLog(error?.message || '');
    }

    const requester = payload as Requester;

    // 3. Set requester to res.locals
    res.locals['requester'] = requester;

    return next();

  };
}