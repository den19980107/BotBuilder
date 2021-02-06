import { Router, Request, Response, NextFunction, Application } from "express";
import config from '../../config/server.json';
import jwt from 'jsonwebtoken';

abstract class Route {

    constructor(app: Application) {
        this.registerRoutes(app)
    }

    protected abstract registerRoutes(app: Application): void;

    protected authenticateToken = (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers["authorization"];
        const token = authHeader?.split(' ')[1];

        if (!token) return res.sendStatus(401);

        jwt.verify(token, config.jwt_key, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    }
}
export default Route;