import nodePool from './helper/nodePool'
import ConditionNode from './nodes/condition.node'
import HttpResponseNode from './nodes/httpResponse.node'
import WebHookNode from './nodes/webhook.node'
import FetchDataNode from './nodes/fetchData.node'

// models
import BotModel from '../models/bot.model';

// constants
import * as NodeType from './constant/nodeType.constants'

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

const flow1: FLOW = {
    '1': {
        name: "get some random user from api",
        type: "WEB_HOOK",
        payload: {
            route: "/getrandomuser",
            method: "GET",
            storeBodyAt: "Data"
        },
        next_node_id: "2"
    },
    '2': {
        name: "fetch user from api",
        type: "FETCH_DATA",
        payload: {
            url: "https://jsonplaceholder.typicode.com/comments",
            method: "GET",
            body: null,
            headers: null,
            storeDataAt: "fetchResult"
        },
        next_node_id: "3"
    },
    '3': {
        name: "response api data",
        type: "HTTP_RESPONSE",
        payload: {
            statusCode: 200,
            responseData: "#DATA.fetchResult[1]"
        },
        next_node_id: null
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
        const bots = await BotModel.find()
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
            const nodeData = flow1[id];
            const { name, payload, type, next_node_id } = nodeData
            switch (nodeData.type) {
                case NodeType.WEB_HOOK:
                    const webhook_node = new WebHookNode(id, name, payload, type, next_node_id);
                    nodePool.set(webhook_node.id, webhook_node);
                    // 事件類型的節點在建立後就要馬上 RUN
                    nodePool.run(id, null);
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
                    // TODO
                    break;
                case NodeType.LOOP:
                    // TODO
                    break;
                case NodeType.BASIC_CACULATION:
                    // TODO
                    break;
            }
        })
    }
}
