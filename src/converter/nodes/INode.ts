import { Request, Response } from "express";
import FlowShareVariable from "../helper/flowShareVariable";
import ScriptParser from "../helper/scriptParser";

export interface HTTP_Data {
    req: Request,
    res: Response
}

abstract class node {
    id: string;
    name: string;
    payload: any;
    type: string;
    next_node_id: string | null

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        this.id = id;
        this.name = name;
        this.payload = payload;
        this.type = type;
        this.next_node_id = next_node_id;
    }

    abstract run(flowShareVariable: FlowShareVariable, HTTP_Data: HTTP_Data | null): Promise<any>

    abstract remove(): void

    /**
     * 用來查看每個節點的資料是否有需要轉換的
     * 我們提供使用者在前端可以透過 "DATA.[somthing]" 來取得同一個 flow 中儲存的變數
     * 當需要使用這些變數的時候需要到 flowShareVariable 中取得目前該變數的值
     * 所以提供這個 parsingPayload 的方法，每個節點在要拿取資料之前都應該先使用這個 function
     * 檢查一下裡面有沒有需要轉換的變數
     * @param payload 每個節點的資料
     * @param flowShareVariable flow 中共想的變數儲存的位址
     * @returns 
     */
    protected parsingPayload<T>(payload: any, flowShareVariable: FlowShareVariable): T {
        // 這邊需要將物件做 "深拷貝" 不然一樣會改掉節點內部的 payload
        const copyPayload = JSON.parse(JSON.stringify(payload));

        const payloadKeys = Object.keys(copyPayload)

        for (const key of payloadKeys) {
            copyPayload[key] = ScriptParser.scriptParserMiddleware(copyPayload[key], flowShareVariable)
            if (copyPayload[key]) {
                try {
                    copyPayload[key] = JSON.parse(copyPayload[key])
                } catch (e) {
                    console.log("cant not parse this payload, use original payload instead")
                }
            }
        }
        return copyPayload;
    }
}

export default node;