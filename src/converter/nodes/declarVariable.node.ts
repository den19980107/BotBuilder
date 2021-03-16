import globalVariable from "../helper/globalVariable";
import ScriptParser from "../helper/scriptParser";
import node from "./INode";

class DeclarVariable extends node {
    payload: { key: string, value: any }

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload
    }

    async run(param: any): Promise<void> {
        globalVariable.set(this.payload.key, this.payload.value);
    }

}