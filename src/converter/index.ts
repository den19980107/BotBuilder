import nodePool from './helper/nodePool'
import ConditionNode from './nodes/condition.node'
import HttpResponseNode from './nodes/httpResponse.node'
import WebHookNode from './nodes/webhook.node'
import FetchDataNode from './nodes/fetchData.node'
import DeclarVariableNode from './nodes/declarVariable.node'
import InsertRowNode from './nodes/database/insertRow.node'
import ScheduleNode from './nodes/schedule.node'
import RedirectNode from './nodes/redirect.node';

// models
import ScriptModel from '../models/script.model';

import FlowShareVariable from './helper/flowShareVariable'
import { reactFlowElementsToBotBuilderFlow } from './helper/nodeToScriptConvertor'

// constants
import { Constants } from 'botbuilder-share'
const { NodeType } = Constants

export interface SCRIPT {
    [key: string]: FLOW
}

export interface NODE {
    name: string,
    type: string,
    payload: any,
    next_node_id: string | null
}

export interface FLOW {
    [key: string]: NODE
}

export default class NodeConverter {
    static async start() {
        // get all bots scripts
        const scripts: Array<SCRIPT> = await this.getAllScript()
        // for each bot script
        scripts.forEach(script => {
            NodeConverter.convertScript(script)
        })
    }

    static async getAllScript(): Promise<SCRIPT[]> {
        const bots = await ScriptModel.find({})
        const scripts: Array<SCRIPT> = [];
        for (let bot of bots) {
            const script = await reactFlowElementsToBotBuilderFlow(JSON.parse(bot.nodes))
            scripts.push(script);
        }
        return scripts
    }

    static convertScript(script: SCRIPT) {
        // get all flows
        const flows_id = Object.keys(script);
        // for each flow
        flows_id.forEach(flow_id => {
            // generate node
            const flow = script[flow_id]
            NodeConverter.convertFlow(flow)
        })
    }

    static convertFlow(flow: FLOW) {
        const nodes_id = Object.keys(flow)

        // 把所有 node 建立起來存放在 global node 中
        nodes_id.forEach(id => {
            const node = flow[id];
            this.generateNode(id, node)
        })
    }

    static scriptToFlows(script: SCRIPT): Array<FLOW> {
        const flows_id = Object.keys(script);
        let flows: Array<FLOW> = [];
        for (let flow_id of flows_id) {
            flows.push(script[flow_id])
        }
        return flows
    }


    static flowToNodes(flow: FLOW): Array<NODE> {
        const nodes_id = Object.keys(flow);
        let nodes: Array<NODE> = [];
        for (let node_id of nodes_id) {
            nodes.push(flow[node_id])
        }
        return nodes
    }

    static removeScriptNodes(script: SCRIPT) {
        let AllNodesId: Array<string> = []
        const flows = NodeConverter.scriptToFlows(script)
        for (const flow of flows) {
            const nodeIds = Object.keys(flow);
            AllNodesId = AllNodesId.concat(nodeIds)
        }
        for (const nodeId of AllNodesId) {
            const node = nodePool.get(nodeId);
            if (node) {
                node.remove()
            }
        }
    }

    static generateNode(id: string, node: NODE) {
        const { name, payload, type, next_node_id } = node
        const flowShareVariable = new FlowShareVariable()
        switch (node.type) {
            case NodeType.WEB_HOOK:
                const webhook_node = new WebHookNode(id, name, payload, type, next_node_id);
                nodePool.set(webhook_node.id, webhook_node);
                // 事件類型的節點在建立後就要馬上 RUN
                nodePool.run(id, flowShareVariable, null);
                break;
            case NodeType.SCHEDULE:
                const schedule_node = new ScheduleNode(id, name, payload, type, next_node_id);
                nodePool.set(schedule_node.id, schedule_node);
                // 事件類型的節點在建立後就要馬上 RUN
                nodePool.run(id, flowShareVariable, null);
                break;
            case NodeType.CONDITION:
                const condition_node = new ConditionNode(id, name, payload, type, null)
                nodePool.set(condition_node.id, condition_node);
                break;
            case NodeType.HTTP_RESPONSE:
                const httpResponse_node = new HttpResponseNode(id, name, payload, type, next_node_id)
                nodePool.set(httpResponse_node.id, httpResponse_node);
                break;
            case NodeType.REDIRECT:
                const redirect_node = new RedirectNode(id, name, payload, type, next_node_id);
                nodePool.set(redirect_node.id, redirect_node);
                break;
            case NodeType.FETCH_DATA:
                const fecthData_node = new FetchDataNode(id, name, payload, type, next_node_id)
                nodePool.set(fecthData_node.id, fecthData_node);
                break;
            case NodeType.DECLAR_VARIABLE:
                const declarVariable_node = new DeclarVariableNode(id, name, payload, type, next_node_id)
                nodePool.set(declarVariable_node.id, declarVariable_node);
                break;
            case NodeType.INSERT_ROW:
                const insertRow_node = new InsertRowNode(id, name, payload, type, next_node_id)
                nodePool.set(insertRow_node.id, insertRow_node);
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
    }
}
