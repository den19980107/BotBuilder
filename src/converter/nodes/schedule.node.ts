import flowShareVariable from "../helper/flowShareVariable";
import node, { HTTP_Data } from "./INode";
import * as schedule from 'node-schedule';
import nodePool from "../helper/nodePool";
import { ScheduleNodePayload } from 'botbuilder-share';

export default class Schedule extends node {
    payload: ScheduleNodePayload
    job: schedule.Job | null

    constructor(id: string, name: string, payload: any, type: string, next_node_id: string | null) {
        super(id, name, payload, type, next_node_id);
        this.payload = payload;
        this.job = null;
    }


    async run(flowShareVariable: flowShareVariable, HTTP_Data: HTTP_Data | null): Promise<void> {
        const startDate = new Date(this.payload.startDate);
        const endDate = this.payload.endDate ? new Date(this.payload.endDate) : undefined;
        const dayOfWeek = this.payload.dayOfWeek ? this.payload.dayOfWeek.join(",") : "*"

        this.job = schedule.scheduleJob({ start: startDate, end: endDate, rule: `${this.payload.minute} ${this.payload.hour} * * ${dayOfWeek}` }, () => {
            if (this.next_node_id) {
                nodePool.run(this.next_node_id, flowShareVariable, HTTP_Data);
            }
        })

    }
    remove(): void {
        if (this.job) {
            schedule.cancelJob(this.job);
        }
    }

}