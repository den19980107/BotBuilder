import { Edge, Elements, Node } from "react-flow-renderer";
import { v4 as uuidv4 } from 'uuid'
import { FLOW, NODE, SCRIPT } from "..";

// constants
import { Constants } from 'botbuilder-share'
const { NodeType } = Constants

export const reactFlowNodesToBotBuilderFlow = (elements: Elements<any>): SCRIPT => {
    const script: SCRIPT = {};
    const inputIds: string[] = []
    const nodePool: { [key: string]: NODE } = {}

    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];

        const node = el as Node;
        const edge = el as Edge;

        if (node.id.includes("node_")) {
            const node: NODE = {
                name: el.data.label,
                type: el.data.type,
                payload: el.data.payload,
                next_node_id: null
            }
            nodePool[el.id] = node;
            if (el.type === "input") {
                inputIds.push(el.id)
            }
        }
        else if (edge.id.includes("edge_")) {
            if (nodePool[edge.source].type === NodeType.CONDITION) {
                if (edge.sourceHandle === "true") {
                    nodePool[edge.source].payload.true_run_node_id = edge.target
                } else if (edge.sourceHandle === "false") {
                    nodePool[edge.source].payload.false_run_node_id = edge.target
                }
            } else {
                nodePool[edge.source].next_node_id = edge.target
            }
        }
    }

    for (let i = 0; i < inputIds.length; i++) {
        const flow: FLOW = {}
        let firstNodeId: string | null = inputIds[i]


        const search = (nodeId: string) => {
            const node = nodePool[nodeId];
            if (!node) return

            flow[nodeId] = node;

            if (node.next_node_id) search(node.next_node_id);
            if (node.payload.true_run_node_id) search(node.payload.true_run_node_id);
            if (node.payload.false_run_node_id) search(node.payload.false_run_node_id);
        }


        search(firstNodeId)

        script[`flow_${uuidv4()}`] = flow
    }
    return script
}
