import node, { HTTP_Data } from './INode';
import { app } from '../../server';
import nodePool from '../helper/nodePool';

// constants
import HttpMethods from '../constant/httpMethod.constants'
import FlowShareVariable from '../helper/flowShareVariable';

export default class WebHookNode extends node {
    payload: { route: string; method: string; storeBodyAt: string }

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload
    }

    async run(flowShareVariable: FlowShareVariable, HTTP_Data: HTTP_Data | null): Promise<void> {
        console.log("webhook node is check if need parseing")
        this.checkIfNeedParsing(this.payload, flowShareVariable);
        console.log("webhook node is running...")

        switch (this.payload.method) {
            case HttpMethods.GET:
                app.get(this.payload.route, (req, res) => {
                    if (this.payload.storeBodyAt) {
                        // save to global variable
                        console.log("req.body", req.body)
                        flowShareVariable.set(this.payload.storeBodyAt, req.body);
                    }
                    if (this.next_node_id) {
                        // set http data
                        HTTP_Data = {
                            req,
                            res
                        }
                        // run node by id
                        nodePool.run(this.next_node_id, flowShareVariable, HTTP_Data);
                    }
                })
                break;
            case HttpMethods.POST:
                // TODO
                break;
            case HttpMethods.PUT:
                // TODO
                break;
            case HttpMethods.DELETE:
                // TODO
                break;
        }
    }
}