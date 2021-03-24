import { Application, Request, Response } from "express";
import Route from "./route";
import config from '../../config/server.json'
import botModel from "../models/bot.model";

class UserRoute extends Route {
    protected registerRoutes(app:Application){
        app.get(`${config.API_PREFIX_URL}/user/bots`,this.authenticateToken,this.getBotsByUserId)
    }

    private async getBotsByUserId(req:Request,res:Response){
        const userId = req.user.id;
        const bots = await botModel.find({belongUserId:userId});
        res.json({bots})
    }
}


export default UserRoute;