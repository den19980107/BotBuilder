import node, { HTTP_Data } from "./INode";
import fetch from 'node-fetch';
import nodePool from "../helper/nodePool";
import FlowShareVariable from "../helper/flowShareVariable";

interface FetchDataNodePayload {
    url: string,
    method: string,
    body: any,
    headers: { [keys: string]: string },
    storeDataAt: string
}

export default class FetchDataNode extends node {

    payload: FetchDataNodePayload

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload
    }

    async run(flowShareVariable: FlowShareVariable, HTTP_Data: HTTP_Data | null): Promise<void> {
        console.log("fetch data node is check if need parseing")

        console.log("parsing the node payload...")
        const payload = this.parsingPayload<FetchDataNodePayload>(this.payload, flowShareVariable);

        const { url, method, body, headers, storeDataAt } = payload
        try {
            const res = await fetch(url, {
                method,
                body,
                headers
            })
            console.log("response is ", res)
            const json = await res.json();
            console.log("pares json is ", json);
            flowShareVariable.set(storeDataAt, json)

            if (this.next_node_id) {
                nodePool.run(this.next_node_id, flowShareVariable, HTTP_Data);
            }
        } catch (e) {
            console.log("running fetch data node have some error", e)
        }
    }
    remove(): void {
        nodePool.remove(this.id)
    }
}
