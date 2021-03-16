import globalVariabal from "../helper/globalVariable";
import nodePool from "../helper/nodePool";
import node from "./node";
import { Response } from 'express'
export default class HttpResponseNode extends node {
    // statusCode: 200,
    // responseData: null
    payload: { statusCode: number, responseData: any }

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload
    }

    run(param: any): void {
        const res: Response = param.res;
        res.status(this.payload.statusCode).json(this.payload.responseData);
        if (this.next_node_id) {
            nodePool.run(this.next_node_id, param);
        }
    }
}
