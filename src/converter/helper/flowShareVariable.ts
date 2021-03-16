export default class FlowShareVariable {
    store: { [key: string]: any } = {}

    set = (key: string, value: any) => {
        this.store[key] = value;
    }

    get = (key: string) => {
        return this.store[key]
    }
}