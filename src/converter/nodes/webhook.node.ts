import node, { HTTP_Data } from './INode';
import { app } from '../../server';
import nodePool from '../helper/nodePool';

import FlowShareVariable from '../helper/flowShareVariable';
import { Request, Response } from 'express';
import { WebHookNodePayload } from 'botbuilder-share';
import { Constants } from 'botbuilder-share'
const { HttpMethods } = Constants

export default class WebHookNode extends node {
    payload: WebHookNodePayload

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload
    }

    async run(flowShareVariable: FlowShareVariable, HTTP_Data: HTTP_Data | null): Promise<void> {
        console.log("webhook node is check if need parseing")

        console.log("parsing the node payload...")
        const payload = this.parsingPayload<WebHookNodePayload>(this.payload, flowShareVariable);

        const { userId, route, method, storeBodyAt } = payload

        const registeRoute = (req: Request, res: Response) => {
            if (storeBodyAt) {
                // save to global variable
                console.log("req.body", req.body)
                flowShareVariable.set(storeBodyAt, req.body);
            }
            if (this.next_node_id) {
                // set http data
                HTTP_Data = {
                    req,
                    res
                }
                // run node by id
                nodePool.run(this.next_node_id, flowShareVariable, HTTP_Data);
            }
        }

        switch (method) {
            case HttpMethods.GET:
                app.get(`/${userId}/${route}`, registeRoute)
                break;
            case HttpMethods.POST:
                app.post(`/${userId}/${route}`, registeRoute)
                break;
            case HttpMethods.PUT:
                app.put(`/${userId}/${route}`, registeRoute)
                break;
            case HttpMethods.DELETE:
                app.delete(`/${userId}/${route}`, registeRoute)
                break;
        }
    }

    remove(): void {
        nodePool.remove(this.id)
        this.removeRoute(this.payload.method, this.payload.route)
    }

    removeRoute(method: string, path: string) {
        let newStack = app._router.stack
        let needDeleteRouteIndex = [];
        for (let i = 0; i < newStack.length; i++) {
            const currentRoute = newStack[i];
            if (currentRoute.route && currentRoute.route.path && currentRoute.route.path === path && currentRoute.route.methods[method.toLowerCase()]) {
                needDeleteRouteIndex.push(i);
            }
        }
        // [0,1,2,3,4,5,6,7]
        // need remove [4,6,7] as needDelete
        // step1 remove 4 
        // arr.splice(4,1)
        // => [0,1,2,3,5,6,7]
        // step2 remove 6 but 6 current in position 5 
        // => [0,1,2,3,5,7]
        // step3 remove 7 but 7 current in position 5
        // 所以每刪除n個 下一個刪除的 index 就要 -n ，不過前提是已經將需要刪除的 needDelete 排序

        // 將 needDeleteIndex 先排序成由小到大
        needDeleteRouteIndex.sort(function (a, b) {
            return a - b;
        });

        // 定義一個變數來判斷需要刪除幾遍
        let removedCount = 0
        for (let index of needDeleteRouteIndex) {
            // 要刪除的 index 減掉已經刪除的數量 n
            newStack.splice(index - removedCount, 1)
            removedCount++
        }
        app._router.stack = newStack
    }
}