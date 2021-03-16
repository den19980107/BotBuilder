export default class globalVariable {
    static store: { [key: string]: any } = {}

    static set = (key: string, value: any) => {
        globalVariable.store[key] = value;
    }

    static get = (key: string) => {
        return globalVariable.store[key]
    }
}