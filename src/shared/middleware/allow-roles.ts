import { Requester, UserRole } from "@shared/interface";
import { Handler, NextFunction, Request, Response } from "express";

export const allowRoles = (roles: UserRole[]): Handler => {
  return (req: Request, res: Response, next: NextFunction) : any => {
    if (!res.locals.requester) return res.status(401).json({ error: 'Unauthorized' });

    const requester = res.locals.requester as Requester;

    if (roles.indexOf(requester.role) === -1) return res.status(401).json({ error: 'Unauthorized' });

    next();
  };
};