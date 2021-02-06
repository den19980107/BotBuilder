import { Request, Response, NextFunction, Application } from 'express';
import Route from "./route";
import jwt from 'jsonwebtoken';
import config from '../../config/server.json';

// Temp DataBase
const username_password: any = {

}
// end of Temp DataBase

class AuthRoute extends Route {

    protected registerRoutes(app: Application) {
        app.post('/register', this.register)
        app.post("/login", this.login)
        app.get("/getPrivateData", this.authenticateToken, this.getPrivateData)
    }

    private register(req: Request, res: Response) {
        const { username, password } = req.body

        // create a user if not exist
        if (username_password[username]) {
            res.status(400).json({ msg: "already has this user!" })
            return;
        }
        username_password[username] = password
        res.status(200).json({ msg: "success" })
    }

    private login(req: Request, res: Response) {
        const { username, password } = req.body

        // if has this user
        if (!username_password[username]) {
            res.status(400).json({ msg: "this username is not fund yet,please register first!" })
            return;
        }

        const user = {
            name: username
        }
        const accessToken = jwt.sign(user, config.jwt_key)
        res.json({ accessToken: accessToken });
    }

    private getPrivateData(req: Request, res: Response) {
        res.send("this is private data")
    }

}

export default AuthRoute;
