import node, { HTTP_Data } from "./INode";
import fetch from 'node-fetch';
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

            const res = await fetch(url, {
                method,
                // TODO 這邊 postInForm 應該也要是 boolean 但卻是 string，先用這樣之後要修
                body: this.bodyDataConvertor(body, postInForm as any === 'true'),
                headers: this.headerDataConvertor(headers),
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

    headerDataConvertor(rawHeader: any) {
        if (!rawHeader) return null;
        // TODO 現在用 JSON.parse 只是應付一下而已，之後要改掉，照理說傳過來要可以直接用
        return JSON.parse(rawHeader);
    }

    bodyDataConvertor(rawBody: any, postInFrom: boolean) {
        if (!rawBody) return null;
        // TODO 現在用 JSON.parse 只是應付一下而已，之後要改掉，照理說傳過來要可以直接用
        const parseHeaders = JSON.parse(rawBody);
        if (postInFrom) {
            const formData = new URLSearchParams(parseHeaders);
            return formData;
        } else {
            return parseHeaders;
        }
    }

    remove(): void {
        nodePool.remove(this.id)
    }
}
