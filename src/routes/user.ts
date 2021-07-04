import { Application, Request, Response } from "express";
import Route from "./route";
import config from '../../config/server.json'
import scriptModel from "../models/script.model";

class UserRoute extends Route {
    protected registerRoutes(app: Application) {
        app.get(`${config.API_PREFIX_URL}/user/scripts`, this.authenticateToken, this.getScriptsByUserId)
    }

    private async getScriptsByUserId(req: Request, res: Response) {
        const userId = req.user.id;
        const { onlyScriptMoudle } = req.query;

        const filter: any = {
            belongUserId: userId
        }

        if (onlyScriptMoudle) {
            filter["isMoudle"] = true;
        }

        const scripts = await scriptModel.find(filter);
        res.json({ scripts })
    }
}


export default UserRoute;