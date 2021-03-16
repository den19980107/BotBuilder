import node from "../nodes/INode";

export default class nodePool {
    static pool: { [key: string]: node } = {}

    static set = (key: string, node: node) => {
        nodePool.pool[key] = node;
    }

    static get = (key: string) => {
        return nodePool.pool[key]
    }

    static run = async (key: string, param: any) => {
        const node = nodePool.get(key);
        await node.run(param);
    }
}