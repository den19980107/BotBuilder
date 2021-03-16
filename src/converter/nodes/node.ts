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

    abstract run(param: any): void
}

export default node;