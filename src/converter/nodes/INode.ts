import { Request, Response } from "express";
import FlowShareVariable from "../helper/flowShareVariable";
import ScriptParser from "../helper/scriptParser";

export interface HTTP_Data {
    req: Request,
    res: Response
}

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

    abstract run(flowShareVariable: FlowShareVariable, HTTP_Data: HTTP_Data | null): Promise<any>

    protected checkIfNeedParsing(payload: any, flowShareVariable: FlowShareVariable): void {
        const payloadKeys = Object.keys(payload)
        payloadKeys.forEach(key => {
            this.payload[key] = ScriptParser.scriptParserMiddleware(this.payload[key], flowShareVariable)
        })
    }
}

export default node;