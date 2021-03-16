import node from './INode';
import { app } from '../../server';
import globalVariable from '../helper/globalVariable';
import nodePool from '../helper/nodePool';
import ScriptParser from '../helper/scriptParser';

// constants
import * as httpMethods from '../constant/httpMethod.constants'

export default class WebHookNode extends node {
    payload: { route: string; method: string; storeBodyAt: string }

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload
    }

    async run(param: any): Promise<void> {
        console.log("webhook node is check if need parseing")
        this.checkIfNeedParsing(this.payload);
        console.log("webhook node is running...")

        switch (this.payload.method) {
            case httpMethods.GET:
                app.get(this.payload.route, (req, res) => {
                    if (this.payload.storeBodyAt) {
                        // save to global variable
                        console.log("req.body", req.body)
                        globalVariable.set(this.payload.storeBodyAt, req.body);
                    }
                    if (this.next_node_id) {
                        // run node by id
                        const param = {
                            req, res
                        }
                        nodePool.run(this.next_node_id, param);
                    }
                })
                break;
            case httpMethods.POST:
                // TODO
                break;
            case httpMethods.PUT:
                // TODO
                break;
            case httpMethods.DELETE:
                // TODO
                break;
        }
    }
}