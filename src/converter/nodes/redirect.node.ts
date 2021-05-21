import flowShareVariable from "../helper/flowShareVariable";
import node, { HTTP_Data } from "./INode";
import nodePool from "../helper/nodePool";
import { RedirectNodePayload } from 'botbuilder-share';

export default class Schedule extends node {
    payload: RedirectNodePayload

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload;
    }


    async run(flowShareVariable: flowShareVariable, HTTP_Data: HTTP_Data | null): Promise<void> {
        console.log("http redirect node is check if need parseing")

        console.log("parsing the node payload...")
        const payload = this.parsingPayload<RedirectNodePayload>(this.payload, flowShareVariable);

        const { url } = payload

        if (HTTP_Data) {
            const { res } = HTTP_Data
            res.redirect(url);
        } else {
            console.error("http response node dosent have 'res' to response data")
        }
    }
    remove(): void {
        nodePool.remove(this.id);
    }

}