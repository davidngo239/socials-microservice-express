import { ITokenIntrospect, MdlFactory } from "@shared/interface";
import { NextFunction, Request, Response } from "express";
import { allowRoles } from "./allow-roles";
import { authMiddleware } from "./auth";

export const setupMiddlewares = (
    introspector: ITokenIntrospect,
): MdlFactory => {

    const auth = authMiddleware(introspector);

    const optAuth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await auth(req, res, next);
        } catch (e) {
            next();
        }
    };

    return {
        auth,
        optAuth,
        allowRoles,
    };
};