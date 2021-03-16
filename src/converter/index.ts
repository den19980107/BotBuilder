import nodePool from './helper/nodePool'
import ConditionNode from './nodes/condition.node'
import HttpResponseNode from './nodes/httpResponse.node'
import WebHookNode from './nodes/webhook.node'
import FetchDataNode from './nodes/fetchData.node'

// constants
import * as NodeType from './constant/nodeType.constants'

interface FLOW {
    [key: string]: {
        name: string,
        type: string,
        payload: any,
        next_node_id: string | null
    }
}

const flow1: FLOW = {
    'root': {
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

export default () => {
    const nodes_id = Object.keys(flow1)

    // 把所有 node 建立起來存放在 global node 中
    nodes_id.forEach(id => {
        const nodeData = flow1[id];
        const { name, payload, type, next_node_id } = nodeData
        switch (nodeData.type) {
            case NodeType.WEB_HOOK:
                const webhook_node = new WebHookNode(id, name, payload, type, next_node_id);
                nodePool.set(webhook_node.id, webhook_node);
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

    // run the first node
    nodePool.run("root", null)
}


