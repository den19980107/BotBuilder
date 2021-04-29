import { DatabaseService } from "../../../service/databaseService";
import flowShareVariable from "../../helper/flowShareVariable";
import nodePool from "../../helper/nodePool";
import node, { HTTP_Data } from "../INode";
import { InsertRowNodePayload } from 'botbuilder-share';

export default class InsertRowNode extends node {

    payload: InsertRowNodePayload;

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload
    }

    async run(flowShareVariable: flowShareVariable, HTTP_Data: HTTP_Data | null): Promise<any> {
        console.log("insert row node is running...")

        console.log("parsing the node payload...")
        // 因為把要 insert 到 db 的資料都放在 payload.data 所以只要用 payload.data 去 parsing 就好
        const payload = this.parsingPayload<InsertRowNodePayload>(this.payload.data, flowShareVariable);

        try {
            await DatabaseService.createNewRowOfValuesInTableByTableId(this.payload.tableId, payload);

            if (this.next_node_id) {
                nodePool.run(this.next_node_id, flowShareVariable, HTTP_Data);
            }
        } catch (err) {
            console.log("running insertRow node have some error", err)
        }
    }
    remove(): void {
        nodePool.remove(this.id)
    }

}
