import { Edge, Elements, Node } from "react-flow-renderer";
import { v4 as uuidv4 } from 'uuid'
import { BOT_BUILDER_FLOW, BOT_BUILDER_NODE, BOT_BUILDER_SCRIPT } from "..";

// constants
import { Constants, ScriptMoudleNodePayload } from 'botbuilder-share'
import ScriptModel from "../../models/script.model";
const { NodeType } = Constants

export const reactFlowElementsToBotBuilderFlow = async (elements: Elements<any>): Promise<BOT_BUILDER_SCRIPT> => {
    const script: BOT_BUILDER_SCRIPT = {};
    const inputIds: string[] = []
    const nodePool: { [key: string]: BOT_BUILDER_NODE } = {}

    elements = await mergeMoudleScriptElement(elements);

    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];

        const nodeElement = el as Node;
        const edgeElement = el as Edge;


        if (nodeElement.id.includes("node_")) {
            const node: BOT_BUILDER_NODE = {
                name: el.data.label,
                type: el.data.type,
                payload: el.data.payload,
                next_node_id: null
            }
            nodePool[el.id] = node;
            if (el.type === "event") {
                inputIds.push(el.id)
            }
        }
        else if (edgeElement.id.includes("edge_")) {
            if (nodePool[edgeElement.source].type === NodeType.CONDITION) {
                if (edgeElement.sourceHandle === "true") {
                    nodePool[edgeElement.source].payload.true_run_node_id = edgeElement.target
                } else if (edgeElement.sourceHandle === "false") {
                    nodePool[edgeElement.source].payload.false_run_node_id = edgeElement.target
                }
            } else {
                nodePool[edgeElement.source].next_node_id = edgeElement.target
            }
        }
    }

    for (let i = 0; i < inputIds.length; i++) {
        const flow: BOT_BUILDER_FLOW = {}
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


const mergeMoudleScriptElement = async (elements: Elements<any>) => {
    let mergedElements: Elements<any> = [];
    // 判斷有沒有 script moudle 的節點
    for (let i = 0; i < elements.length; i++) {
        const nodeElement = elements[i] as Node;

        // 1. 判斷是否為 script moudle
        if (nodeElement.data && nodeElement.data.type === NodeType.SCRIPT_MOUDLE) {
            const payload: ScriptMoudleNodePayload = nodeElement.data.payload
            // 2. 找出 script moudle 內的 script
            const script = await ScriptModel.findById(payload.scriptId);
            if (script) {
                let moudleScriptElements: Elements<any> = JSON.parse(script.nodes)
                // 3. 找出 start node
                const startNode = moudleScriptElements.filter(e => e.data && e.data.type === NodeType.MOUDLE_START)[0];
                // 4. 找出 start node 連接的 edge
                const firstEdge = moudleScriptElements.filter(e => {
                    const edge = e as Edge;
                    return edge.source && edge.source === startNode.id
                })[0] as Edge
                // 5. 找出 start node 連接的第一個 node
                const firstNode = moudleScriptElements.filter(e => e.id === firstEdge.target)[0];
                // 5.1 找出第一個 node 後的 edge
                const firstNodeNextEdge = moudleScriptElements.filter(e => {
                    const edge = e as Edge;
                    return edge.source === firstNode.id;
                })[0] as Edge
                // 6. 將 script moudle 的 id 給第一個 node
                firstNode.id = nodeElement.id;
                // 6.1 將第一個節點後面的 edge 的 source 也跟著更改
                moudleScriptElements = moudleScriptElements.map(e => {
                    const edge = e as Edge;
                    if (edge.id === firstNodeNextEdge.id) {
                        edge.source = nodeElement.id;
                    }
                    return edge;
                })
                // 7. 刪掉 start node 和連接的 edge
                moudleScriptElements = moudleScriptElements.filter(e => e.id !== startNode.id && e.id !== firstEdge.id);
                // 8. 找到 script moudle 後連接的 edge
                const moudleNodeEdge = elements.filter(e => {
                    const edge = e as Edge;
                    return edge.source === nodeElement.id
                })[0] as Edge
                // 9. 找到 end node
                const endNode = moudleScriptElements.filter(e => e.data && e.data.type === NodeType.MOUDLE_END)[0];
                // 10. 找到 end node 連接的 edge
                const lastEdge = moudleScriptElements.filter(e => {
                    const edge = e as Edge
                    return edge.target === endNode.id
                })[0] as Edge
                // 11. 找到 end node 前一個 node
                const lastNode = moudleScriptElements.filter(e => e.id === lastEdge.source)[0];
                // 12. 將 script moudle 後的 edge 的 source 改為子腳本內最後一個節點的 id
                moudleNodeEdge.source = lastNode.id;
                // 13. 刪除子腳本內的 end node 與跟 end node 連接的 edge
                moudleScriptElements = moudleScriptElements.filter(e => e.id !== endNode.id && e.id !== lastEdge.id);
                // 14. 將結果 merge 回去
                mergedElements = mergedElements.concat(moudleScriptElements);
            }
        } else {
            mergedElements.push(elements[i])
        }
    }

    return mergedElements
}