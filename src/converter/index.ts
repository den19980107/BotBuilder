import { Application } from 'express'
import nodePool from './helper/nodePool'
import ConditionNode from './nodes/condition'
import HttpResponseNode from './nodes/httpResponse'
import WebHookNode from './nodes/webhook'

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
        name: "is greater than 10",
        type: "WEB_HOOK",
        payload: {
            route: "/isgreaterthan10",
            method: "GET",
            storeBodyAt: "Data"
        },
        next_node_id: "2"
    },
    '2': {
        name: "check data is greater than 10?",
        type: "CONDITION",
        payload: {
            condition: "Data.value",
            operator: "GREATER",
            operant: 10,
            true_run_node_id: "3",
            false_run_node_id: "4"
        },
        next_node_id: null
    },
    '3': {
        name: "response greater",
        type: "HTTP_RESPONSE",
        payload: {
            statusCode: 200,
            responseData: { message: "the result is true" }
        },
        next_node_id: null
    },
    '4': {
        name: "response smaller",
        type: "HTTP_RESPONSE",
        payload: {
            statusCode: 400,
            responseData: { message: "the result is false" }
        },
        next_node_id: null
    }
}

export default (app: Application) => {
    const nodes_id = Object.keys(flow1)

    // 把所有 node 建立起來存放在 global node 中
    nodes_id.forEach(id => {
        const nodeData = flow1[id];
        const { name, payload, type, next_node_id } = nodeData
        switch (nodeData.type) {
            case "WEB_HOOK":
                const webhook_node = new WebHookNode(app, id, name, payload, type, next_node_id);
                nodePool.set(webhook_node.id, webhook_node);
                break;
            case "CONDITION":
                const condition_node = new ConditionNode(id, name, payload, type, next_node_id)
                nodePool.set(condition_node.id, condition_node);
                break;
            case "HTTP_RESPONSE":
                const httpResponse_node = new HttpResponseNode(id, name, payload, type, next_node_id)
                nodePool.set(httpResponse_node.id, httpResponse_node);
                break;
        }
    })
}


