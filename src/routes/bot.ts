import { Request, Response, NextFunction, Application } from 'express';
import Route from "./route";
import config from '../../config/server.json'
import BotModel from '../models/bot.model';
import NodeConverter, { FLOW, NODE, SCRIPT } from '../converter';

class BotRoute extends Route {

    protected registerRoutes(app: Application) {
        app.post(`${config.API_PREFIX_URL}/bot/create`, this.authenticateToken, this.create)
        app.post(`${config.API_PREFIX_URL}/bot/delete/:id`, this.authenticateToken, this.checkIfBotExistAndBotBelongToCurrentUser, this.delete)
        app.post(`${config.API_PREFIX_URL}/bot/update/:id`, this.authenticateToken, this.checkIfBotExistAndBotBelongToCurrentUser, this.update)
        app.get(`${config.API_PREFIX_URL}/bot/:id`, this.authenticateToken, this.checkIfBotExistAndBotBelongToCurrentUser, this.getBotData)
    }

    private async create(req: Request, res: Response) {
        const { name, script } = req.body;
        if (!name || !script) {
            res.status(400).json({ msg: "name or script is empty" });
            return;
        }
        try {
            const newBot = await BotModel.create({
                name,
                script,
                belongUserId: req.user.id
            });
            await newBot.save();

            const newBotScript: SCRIPT = JSON.parse(newBot.script);
            NodeConverter.convertScript(newBotScript)

            res.sendStatus(200);
        } catch (err) {
            res.status(500).json({ err })
        }
    }

    private async delete(req: Request, res: Response) {
        const botId = req.params.id;
        if (!botId) {
            res.status(400).json({ msg: "botId is empty" });
            return;
        }
        try {
            const bot = await BotModel.findById(botId);
            if (bot) {
                await BotModel.findByIdAndDelete(botId)
                const script = JSON.parse(bot.script)
                // 清除 已經建立起來的 node
                NodeConverter.removeScriptNodes(script);
                res.sendStatus(200);
            } else {
                throw new Error("no bot finded");
            }
        } catch (err) {
            res.status(500).json({ err })
        }
    }

    private async update(req: Request, res: Response) {
        const botId = req.params.id;
        if (!botId) {
            res.status(400).json({ msg: "botId is empty" });
            return;
        }
        const { name, script } = req.body;
        if (!name || !script) {
            res.status(400).json({ msg: "name or script is empty" });
            return;
        }
        try {
            await BotModel.findByIdAndUpdate(botId, { name, script });
            res.sendStatus(200);
        } catch (err) {
            res.status(500).json({ err })
        }
    }
    private async getBotData(req: Request, res: Response) {
        const botId = req.params.id;
        if (!botId) {
            res.status(400).json({ msg: "botId is empty" });
            return;
        }
        try {
            const bot = await BotModel.findById(botId);
            res.json(bot);
        } catch (err) {
            res.status(500).json({ err })
        }
    }

    private async checkIfBotExistAndBotBelongToCurrentUser(req: Request, res: Response, next: NextFunction) {
        const userId = req.user.id;
        const botId = req.params.id;
        try {
            const bot = await BotModel.findById(botId)
            if (!bot) {
                // dosent have this bot
                res.status(400).json({ err: "this bot is not exist!" });
                return;
            }
            if (bot.belongUserId !== userId) {
                // not your bot
                res.status(403).json({ err: "this bot is not your's" });
                return;
            }

            next();
        } catch (e) {
            console.error(e)
        }
    }
}

export default BotRoute;
