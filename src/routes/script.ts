import { Request, Response, NextFunction, Application } from "express";
import Route from "./route";
import config from "../../config/server.json";
import ScriptModel from "../models/script.model";
import NodeConverter, { BOT_BUILDER_FLOW, BOT_BUILDER_NODE, BOT_BUILDER_SCRIPT } from "../converter";
import { reactFlowElementsToBotBuilderFlow } from "../converter/helper/nodeToScriptConvertor";

class ScriptRoute extends Route {
    protected registerRoutes(app: Application) {
        app.post(`${config.API_PREFIX_URL}/script/create`, this.authenticateToken, this.create);
        app.post(`${config.API_PREFIX_URL}/script/delete/:id`, this.authenticateToken, this.checkIfScriptExistAndScriptBelongToCurrentUser, this.delete);
        app.post(`${config.API_PREFIX_URL}/script/update/:id`, this.authenticateToken, this.checkIfScriptExistAndScriptBelongToCurrentUser, this.update);
        app.get(`${config.API_PREFIX_URL}/script/:id`, this.authenticateToken, this.checkIfScriptExistAndScriptBelongToCurrentUser, this.getScriptData);
    }

    private async create(req: Request, res: Response) {
        const { name, nodes, isMoudle } = req.body;
        if (!name || !nodes) {
            res.status(400).json({ msg: "name or nodes is empty" });
            return;
        }
        try {
            const newScript = await ScriptModel.create({
                name,
                belongUserId: req.user.id,
                nodes,
                isMoudle
            });
            await newScript.save();

            const newBotScript: BOT_BUILDER_SCRIPT = await reactFlowElementsToBotBuilderFlow(
                JSON.parse(newScript.nodes)
            );
            NodeConverter.convertScript(newBotScript);

            res.sendStatus(200);
        } catch (err) {
            res.status(500).json({ err });
        }
    }

    private async delete(req: Request, res: Response) {
        const scriptId = req.params.id;
        if (!scriptId) {
            res.status(400).json({ msg: "script id is empty" });
            return;
        }
        try {
            const script = await ScriptModel.findById(scriptId);
            if (script) {
                await ScriptModel.findByIdAndDelete(scriptId);
                const nodes = JSON.parse(script.nodes);
                const botScript = await reactFlowElementsToBotBuilderFlow(nodes);
                // 清除 已經建立起來的 node
                NodeConverter.removeScriptNodes(botScript);
                res.sendStatus(200);
            } else {
                throw new Error("no script finded");
            }
        } catch (err) {
            res.status(500).json({ err });
        }
    }

    private async update(req: Request, res: Response) {
        const scriptId = req.params.id;
        if (!scriptId) {
            res.status(400).json({ msg: "script is empty" });
            return;
        }
        const { name, nodes, isMoudle } = req.body;
        if (!name || !nodes) {
            res.status(400).json({ msg: "name or nodes is empty" });
            return;
        }
        try {
            const reactFlowNodes = JSON.parse(nodes);
            const script = await reactFlowElementsToBotBuilderFlow(reactFlowNodes);
            // 清除舊的 node
            NodeConverter.removeScriptNodes(script);

            // 更新 node
            await ScriptModel.findByIdAndUpdate(scriptId, { name, nodes, isMoudle });

            // 建立更新後的 node
            const newBotScript: BOT_BUILDER_SCRIPT = await reactFlowElementsToBotBuilderFlow(
                JSON.parse(nodes)
            );
            NodeConverter.convertScript(newBotScript);
            res.sendStatus(200);
        } catch (err) {
            res.status(500).json({ err });
        }
    }
    private async getScriptData(req: Request, res: Response) {
        const scriptId = req.params.id;
        if (!scriptId) {
            res.status(400).json({ msg: "script id is empty" });
            return;
        }
        try {
            const script = await ScriptModel.findById(scriptId);
            res.json(script);
        } catch (err) {
            res.status(500).json({ err });
        }
    }

    private async checkIfScriptExistAndScriptBelongToCurrentUser(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const userId = req.user.id;
        const scriptId = req.params.id;
        try {
            const script = await ScriptModel.findById(scriptId);
            if (!script) {
                // dosent have this bot
                res.status(400).json({ err: "this script is not exist!" });
                return;
            }
            if (script.belongUserId !== userId) {
                // not your bot
                res.status(403).json({ err: "this script is not your's" });
                return;
            }

            next();
        } catch (e) {
            console.error(e);
        }
    }
}

export default ScriptRoute;
