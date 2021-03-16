import globalVariable from "../helper/globalVariable";
import nodePool from "../helper/nodePool";
import ScriptParser from "../helper/scriptParser";
import node from "./INode";

// constants
import * as conditionOperator from '../constant/conditionOperator.constants'

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

    protected checkIfNeedParsing(): void {
        // 檢查是否含有 "#DATA" 需要從全域變數中讀取
        this.payload.condition = ScriptParser.scriptParserMiddleware(this.payload.condition)
        this.payload.operator = ScriptParser.scriptParserMiddleware(this.payload.operator)
        this.payload.operant = ScriptParser.scriptParserMiddleware(this.payload.operant)
        this.payload.true_run_node_id = ScriptParser.scriptParserMiddleware(this.payload.true_run_node_id)
        this.payload.false_run_node_id = ScriptParser.scriptParserMiddleware(this.payload.false_run_node_id)
    }

    async run(param: any): Promise<void> {
        console.log("condition node is check if need parseing")
        this.checkIfNeedParsing();
        console.log("condition node is running...")
        // store     key       
        // Data = { value : 1}
        const [storeKey, conditionKey] = this.payload.condition.split(".")
        const store = globalVariable.get(storeKey);
        const conditionValue = store[conditionKey]
        console.log({
            "storeKey": storeKey,
            "conditionKey": conditionKey,
            "store": store,
            "conditionValue": conditionValue
        })
        const operantValue = this.payload.operant;
        switch (this.payload.operator) {
            case conditionOperator.GREATER:
                const isGreater = conditionValue > operantValue
                isGreater ? nodePool.run(this.payload.true_run_node_id, param) : nodePool.run(this.payload.false_run_node_id, param)
                break;
            case conditionOperator.GREATER_EQUAL:
                // TODO
                break;
            case conditionOperator.LESSER:
                // TODO
                break;
            case conditionOperator.LESSER_EQUAL:
                // TODO    
                break;
            case conditionOperator.EQUAL:
                // TODO    
                break;
        }
    }
}
