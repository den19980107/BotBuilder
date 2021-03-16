import globalVariabal from "../helper/globalVariable";
import nodePool from "../helper/nodePool";
import node from "./node";

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

    run(param: any): void {
        // store     key       
        // Data = { value : 1}
        const [storeKey, conditionKey] = this.payload.condition.split(".")
        const store = globalVariabal.get(storeKey);
        const conditionValue = store[conditionKey]
        console.log({
            "storeKey": storeKey,
            "conditionKey": conditionKey,
            "store": store,
            "conditionValue": conditionValue
        })
        const operantValue = this.payload.operant;
        switch (this.payload.operator) {
            case "GREATER":
                const isGreater = conditionValue > operantValue
                isGreater ? nodePool.run(this.payload.true_run_node_id, param) : nodePool.run(this.payload.false_run_node_id, param)
        }
    }
}
