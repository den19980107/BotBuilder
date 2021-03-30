import nodePool from './helper/nodePool'
import ConditionNode from './nodes/condition.node'
import HttpResponseNode from './nodes/httpResponse.node'
import WebHookNode from './nodes/webhook.node'
import FetchDataNode from './nodes/fetchData.node'
import DeclarVariableNode from './nodes/declarVariable.node'
// models
import BotModel from '../models/bot.model';

// constants
import NodeType from './constant/nodeType.constants'
import FlowShareVariable from './helper/flowShareVariable'

interface SCRIPT {
    [key: string]: FLOW
}

interface FLOW {
    [key: string]: {
        name: string,
        type: string,
        payload: any,
        next_node_id: string | null
    }
}

export default class NodeConverter {
    static async start() {
        // get all bots scripts
        const scripts: Array<SCRIPT> = await this.getAllScript()
        // for each bot script
        scripts.forEach(script => {
            // get all flows
            const flows_id = Object.keys(script);
            // for each flow
            flows_id.forEach(flow_id => {
                // generate node
                const flow = script[flow_id]
                this.generateNode(flow)
            })
        })
    }

    static async getAllScript(): Promise<SCRIPT[]> {
        const bots = await BotModel.find({})
        const scripts: Array<SCRIPT> = [];
        await bots.forEach(bot => {
            scripts.push(JSON.parse(bot.script))
        })
        return scripts
    }

    static generateNode(flow: FLOW) {
        const nodes_id = Object.keys(flow)

        // 把所有 node 建立起來存放在 global node 中
        nodes_id.forEach(id => {
            const nodeData = flow[id];
            const { name, payload, type, next_node_id } = nodeData
            switch (nodeData.type) {
                case NodeType.WEB_HOOK:
                    const webhook_node = new WebHookNode(id, name, payload, type, next_node_id);
                    nodePool.set(webhook_node.id, webhook_node);
                    // 事件類型的節點在建立後就要馬上 RUN
                    // 建立 flow 共享變數
                    const flowShareVariable = new FlowShareVariable()
                    nodePool.run(id, flowShareVariable, null);
                    break;
                case NodeType.TIMER:
                    // TODO
                    break;
                case NodeType.CONDITION:
                    const condition_node = new ConditionNode(id, name, payload, type, next_node_id)
                    nodePool.set(condition_node.id, condition_node);
                    break;
                case NodeType.HTTP_RESPONSE:
                    const httpResponse_node = new HttpResponseNode(id, name, payload, type, next_node_id)
                    nodePool.set(httpResponse_node.id, httpResponse_node);
                    break;
                case NodeType.FETCH_DATA:
                    const fecthData_node = new FetchDataNode(id, name, payload, type, next_node_id)
                    nodePool.set(fecthData_node.id, fecthData_node);
                    break;
                case NodeType.DECLAR_VARIABLE:
                    const declarVariable_node = new DeclarVariableNode(id, name, payload, type, next_node_id)
                    nodePool.set(declarVariable_node.id, declarVariable_node);
                    break;
                case NodeType.LOOP:
                    // TODO
                    break;
                case NodeType.BASIC_CACULATION:
                    // TODO
                    break;
                case NodeType.DELAY:
                    // TODO
                    break;
                case NodeType.HTML_RESPONSE:
                    // TODO
                    break;
                case NodeType.SEND_EMAIL:
                    // TODO
                    break;
            }
        })
    }
}
