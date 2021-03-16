import ScriptParser from "../helper/scriptParser";

abstract class node {
    id: string;
    name: string;
    payload: any;
    type: string;
    next_node_id: string | null

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        this.id = id;
        this.name = name;
        this.payload = payload;
        this.type = type;
        this.next_node_id = next_node_id;
    }

    abstract run(param: any): Promise<any>

    protected checkIfNeedParsing(payload: any): void {
        const payloadKeys = Object.keys(payload)
        payloadKeys.forEach(key => {
            this.payload[key] = ScriptParser.scriptParserMiddleware(this.payload[key])
        })
    }
}

export default node;