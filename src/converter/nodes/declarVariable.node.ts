import FlowShareVariable from "../helper/flowShareVariable";
import nodePool from "../helper/nodePool";
import node, { HTTP_Data } from "./INode";

interface DeclarVariableNodePayload {
    key: string,
    value: any
}

export default class DeclarNodeVariable extends node {
    payload: { key: string, value: any }

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload
    }

    async run(flowShareVariable: FlowShareVariable, HTTP_Data: HTTP_Data | null): Promise<void> {
        console.log("declar variable node is check if need parseing")

        console.log("parsing the node payload...")
        const payload = this.parsingPayload<DeclarVariableNodePayload>(this.payload, flowShareVariable);

        const { key, value } = payload

        flowShareVariable.set(key, value);

        if (this.next_node_id) {
            nodePool.run(this.next_node_id, flowShareVariable, HTTP_Data);
        }
    }

    remove(): void {
        nodePool.remove(this.id)
    }

}