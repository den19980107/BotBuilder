import node from "../nodes/INode";
import FlowShareVariable from "./flowShareVariable";
import { HTTP_Data } from '../nodes/INode'

export default class nodePool {
    static pool: { [key: string]: node } = {}

    static set = (key: string, node: node) => {
        nodePool.pool[key] = node;
        console.log("set node ", node)
        console.log("current nodes count = ", Object.keys(nodePool.pool))
    }

    static get = (key: string) => {
        return nodePool.pool[key]
    }

    static remove = (key: string) => {
        console.log("remove key:", key)
        console.log("before remove node cont = ", Object.keys(nodePool.pool).length)
        delete nodePool.pool[key];
        console.log("after remove node cont = ", Object.keys(nodePool.pool).length)
    }

    static run = async (key: string, flowShareVariable: FlowShareVariable, HTTP_Data: HTTP_Data | null) => {
        console.log("run key = ", key)
        const node = nodePool.get(key);
        if (node) {
            await node.run(flowShareVariable, HTTP_Data);
        }
    }
}