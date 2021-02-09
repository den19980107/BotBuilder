import { Request, Response, NextFunction, Application } from 'express';
import Route from "./route";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import config from '../../config/server.json';

import UserModel, { IUser } from '../models/user.model';

class AuthRoute extends Route {

    protected registerRoutes(app: Application) {
        app.post('/register', this.register)
        app.post("/login", this.login)
        app.get("/getPrivateData", this.authenticateToken, this.getPrivateData)
    }

    private async register(req: Request, res: Response) {
        const { username, password } = req.body
        if (!username || !password) {
            res.status(400).json({ err: "username or password is empty!" });
            return;
        }
        try {
            // check if user exist
            const oldUser = await UserModel.findOne(({ username }));
            if (oldUser) {
                res.status(400).json({ msg: "already has this user!" })
                return;
            }
            // if not exist, create user
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            const newUser = await UserModel.create({
                username,
                password: hash,
                id: uuid()
            })
            newUser.save();
            res.status(200).json({ msg: "success" });
        } catch (err) {
            res.status(500).json({ err });
        }
    }

    private async login(req: Request, res: Response) {
        const { username, password } = req.body
        try {
            // if has this user
            const user = await UserModel.findOne(({ username }));

            if (!user) {
                res.status(400).json({ msg: "this username is not fund yet,please register first!" })
                return;
            }

            const isMatch = bcrypt.compareSync(password, user.password);
            if (isMatch) {
                const userData = {
                    id: user.id,
                    name: user.username
                }
                const accessToken = jwt.sign(userData, config.jwt_key)
                res.json({ accessToken: accessToken });
            } else {
                res.sendStatus(401)
            }
        } catch (err) {
            res.status(500).json(err)
        }
    }

    private getPrivateData(req: Request, res: Response) {
        res.send("this is private data")
    }

}

export default AuthRoute;
