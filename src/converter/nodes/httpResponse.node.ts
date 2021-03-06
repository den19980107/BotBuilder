import nodePool from "../helper/nodePool";
import node, { HTTP_Data } from "./INode";
import FlowShareVariable from "../helper/flowShareVariable";
import { HttpResponseNodePayload } from 'botbuilder-share';
export default class HttpResponseNode extends node {
    // statusCode: 200,
    // responseData: null
    payload: { statusCode: number, responseData: any }

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload
    }

    async run(flowShareVariable: FlowShareVariable, HTTP_Data: HTTP_Data | null): Promise<void> {
        console.log("http response node is check if need parseing")

        console.log("parsing the node payload...")
        const payload = this.parsingPayload<HttpResponseNodePayload>(this.payload, flowShareVariable);

        const { statusCode, responseData } = payload

        if (HTTP_Data) {
            const { res } = HTTP_Data
            try {
                res.status(statusCode).json(JSON.parse(responseData));
            } catch (e) {
                res.status(statusCode).send(responseData);
            }
            if (this.next_node_id) {
                nodePool.run(this.next_node_id, flowShareVariable, HTTP_Data);
            }
        } else {
            console.error("http response node dosent have 'res' to response data")
        }
    }

    remove(): void {
        nodePool.remove(this.id)
    }
}
