import node from './node';
import { Application } from 'express';
import globalVariabal from '../helper/globalVariable';
import nodePool from '../helper/nodePool';

export default class WebHookNode extends node {
    payload: { route: string; method: string; storeBodyAt: string }

    constructor(app: Application, id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload

        switch (this.payload.method) {
            case 'GET':
                app.get(this.payload.route, (req, res) => {
                    if (this.payload.storeBodyAt) {
                        // save to global variable
                        console.log("req.body", req.body)
                        globalVariabal.set(this.payload.storeBodyAt, req.body);
                    }
                    if (this.next_node_id) {
                        // run node by id
                        const param = {
                            req, res
                        }
                        nodePool.run(this.next_node_id, param);
                    }
                })
        }
    }

    run(param: any): void {
        throw new Error('Method not implemented.');
    }
}