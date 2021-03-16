import globalVariable from "../helper/globalVariable";
import node from "./INode";
import fetch from 'node-fetch';
import nodePool from "../helper/nodePool";
import ScriptParser from "../helper/scriptParser";
export default class FetchData extends node {

    payload: { url: string, method: string, body: any, headers: { [keys: string]: string }, storeDataAt: string }

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload
    }

    async run(param: any): Promise<void> {
        console.log("fetch data node is check if need parseing")
        this.checkIfNeedParsing(this.payload);
        console.log("fetch data node is running...")
        const { url, method, body, headers, storeDataAt } = this.payload
        try {
            const res = await fetch(url, {
                method,
                body,
                headers
            })
            console.log("response is ", res)
            const json = await res.json();
            console.log("pares json is ", json);
            globalVariable.set(storeDataAt, json)

            if (this.next_node_id) {
                nodePool.run(this.next_node_id, param);
            }
        } catch (e) {
            console.log("running fetch data node have some error", e)
        }
    }

}
