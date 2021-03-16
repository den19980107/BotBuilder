import nodePool from "../helper/nodePool";
import node from "./INode";
import { Response } from 'express'
import ScriptParser from "../helper/scriptParser";
export default class HttpResponseNode extends node {
    // statusCode: 200,
    // responseData: null
    payload: { statusCode: number, responseData: any }

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload
    }

    protected checkIfNeedParsing(): void {
        // 檢查是否含有 "#DATA" 需要從全域變數中讀取
        this.payload.statusCode = ScriptParser.scriptParserMiddleware(this.payload.statusCode)
        this.payload.responseData = ScriptParser.scriptParserMiddleware(this.payload.responseData)
    }

    async run(param: any): Promise<void> {
        console.log("http response node is check if need parseing")
        this.checkIfNeedParsing();
        console.log("http response node is running...")

        const res: Response = param.res;
        res.status(this.payload.statusCode).json(this.payload.responseData);
        if (this.next_node_id) {
            nodePool.run(this.next_node_id, param);
        }
    }
}
