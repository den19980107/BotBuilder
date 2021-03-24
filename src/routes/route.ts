import { Router, Request, Response, NextFunction, Application } from "express";
import config from '../../config/server.json';
import jwt from 'jsonwebtoken';
import { IUser } from "../models/user.model";

abstract class Route {

    constructor(app: Application) {
        this.registerRoutes(app)
    }

    protected abstract registerRoutes(app: Application): void;

    protected authenticateToken = (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers["authorization"];
        const token = authHeader?.split(' ')[1];

        if (!token) return res.sendStatus(401);

        // 將 user 資料序列化出來後存在 express req.user 中
        jwt.verify(token, config.jwt_key, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user as IUser;
            next();
        });
    }
}
export default Route;