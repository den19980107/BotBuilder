import node, { HTTP_Data } from "./INode";
import fetch, { RequestInit } from 'node-fetch';
import nodePool from "../helper/nodePool";
import FlowShareVariable from "../helper/flowShareVariable";
import { FetchDataNodePayload } from 'botbuilder-share';

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

        const { url, method, body, headers, storeDataAt, postInForm } = payload
        try {
            const fetchOption: RequestInit = {
                headers: this.headerCheck(headers),
                body: this.bodyCheck(body, postInForm),
                method
            }
            const res = await fetch(url, fetchOption);
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

    headerCheck(header: { [key: string]: string }) {
        if (!header) return undefined;
        return header;
    }

    bodyCheck(body: any, postInForm: boolean) {
        if (!body) return undefined
        if (postInForm) {
            return new URLSearchParams(body)
        } else {
            return body
        }
    }
    remove(): void {
        nodePool.remove(this.id)
    }
}
