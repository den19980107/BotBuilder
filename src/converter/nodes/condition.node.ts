import nodePool from "../helper/nodePool";
import node, { HTTP_Data } from "./INode";

// constants
import ConditionOperator from '../constant/conditionOperator.constants'
import FlowShareVariable from "../helper/flowShareVariable";

export default class ConditionNode extends node {
    // condition: "Data",
    // operator: "GREATER",
    // operant: 10,
    // true_run_node_id: "3",
    // false_run_node_id: "4"
    payload: { condition: string, operator: string, operant: number, true_run_node_id: string, false_run_node_id: string }

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload
    }

    async run(flowShareVariable: FlowShareVariable, HTTP_Data: HTTP_Data | null): Promise<void> {
        console.log("condition node is check if need parseing")
        this.checkIfNeedParsing(this.payload, flowShareVariable);
        console.log("condition node is running...")
        // store     key       
        // Data = { value : 1}
        const [storeKey, conditionKey] = this.payload.condition.split(".")
        const store = flowShareVariable.get(storeKey);
        const conditionValue = store[conditionKey]
        console.log({
            "storeKey": storeKey,
            "conditionKey": conditionKey,
            "store": store,
            "conditionValue": conditionValue
        })
        const operantValue = this.payload.operant;
        switch (this.payload.operator) {
            case ConditionOperator.GREATER:
                const isGreater = conditionValue > operantValue
                isGreater ?
                    nodePool.run(this.payload.true_run_node_id, flowShareVariable, HTTP_Data)
                    :
                    nodePool.run(this.payload.false_run_node_id, flowShareVariable, HTTP_Data)
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
