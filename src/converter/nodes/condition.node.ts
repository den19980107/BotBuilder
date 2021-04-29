import nodePool from "../helper/nodePool";
import node, { HTTP_Data } from "./INode";

import FlowShareVariable from "../helper/flowShareVariable";
import { ConditionNodePayload } from 'botbuilder-share';

import { Constants } from 'botbuilder-share';
const { ConditionOperator } = Constants;

export default class ConditionNode extends node {

    payload: ConditionNodePayload

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload
    }

    async run(flowShareVariable: FlowShareVariable, HTTP_Data: HTTP_Data | null): Promise<void> {
        console.log("condition node is running...")

        console.log("parsing the node payload...")
        const payload = this.parsingPayload<ConditionNodePayload>(this.payload, flowShareVariable);

        const { condition, operator, operant, true_run_node_id, false_run_node_id } = payload

        switch (operator) {
            case ConditionOperator.GREATER:
                const isGreater = condition > operant
                isGreater ?
                    nodePool.run(true_run_node_id, flowShareVariable, HTTP_Data)
                    :
                    nodePool.run(false_run_node_id, flowShareVariable, HTTP_Data)
                break;
            case ConditionOperator.GREATER_EQUAL:
                // TODO
                break;
            case ConditionOperator.LESSER:
                // TODO
                break;
            case ConditionOperator.LESSER_EQUAL:
                // TODO    
                break;
            case ConditionOperator.EQUAL:
                // TODO    
                break;
        }
    }

    remove(): void {
        nodePool.remove(this.id)
    }
}
