import node from "../nodes/INode";
import FlowShareVariable from "./flowShareVariable";
import { HTTP_Data } from '../nodes/INode'

export default class nodePool {
    static pool: { [key: string]: node } = {}

    static set = (key: string, node: node) => {
        nodePool.pool[key] = node;
    }

    static get = (key: string) => {
        return nodePool.pool[key]
    }

    static run = async (key: string, flowShareVariable: FlowShareVariable, HTTP_Data: HTTP_Data | null) => {
        const node = nodePool.get(key);
        await node.run(flowShareVariable, HTTP_Data);
    }
}