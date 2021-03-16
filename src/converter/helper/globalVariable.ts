export default class globalVariabal {
    static store: { [key: string]: any } = {}

    static set = (key: string, value: any) => {
        globalVariabal.store[key] = value;
    }

    static get = (key: string) => {
        return globalVariabal.store[key]
    }
}