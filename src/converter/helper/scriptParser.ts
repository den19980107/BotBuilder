import FlowShareVariable from "./flowShareVariable";

export default class ScriptParser {
    /**
    * 檢查使用者的字串中是否包含 "#DATA" 
    * 如果有的話需要將該字串替換成目前變數中的值
    * EX:
    * payload: {
    *       statusCode: 200,
    *       responseData: "#DATA.fetchResult" => 要替換成 flowShareVariable 中的 "fetchResult" = flowShareVariable.get("fetchResult") 
    * }
    */

    static scriptParserMiddleware<T>(input: unknown, flowShareVariable: FlowShareVariable): T {
        if (!input) return <T><any>null

        let string = String(input)
        const KEY_WORD = "#DATA."
        const includeKeyWord = string.includes(KEY_WORD);
        if (!includeKeyWord) return <T><any>string;

        // 清掉 #DATA.
        string = string.replace(KEY_WORD, "");

        // 取出所有層,每一層我取名叫做 "stack"
        // ex #DATA.some.thing[0].blabla => ["some","thing[0]","blabla"]
        const stacks = string.split(".");

        let returnValue: any;

        for (let i = 0; i < stacks.length; i++) {
            let currentStack = stacks[i]
            // stack 中的第一層要從 gloal variable 中拿取
            if (i == 0) {
                // 如果第一個 stack 中就是陣列 ex something[1]
                if (ScriptParser.checkIfCurrentStackIsArray(currentStack)) {
                    // 先忽視後面的 [1] 因為這一步是要將資料從 global variable 中取出,最後會對陣列進行處理
                    const currentStackWithoutArraySymbol = currentStack.substring(0, currentStack.lastIndexOf("["))

                    returnValue = flowShareVariable.get(currentStackWithoutArraySymbol)

                } else {
                    returnValue = flowShareVariable.get(currentStack)
                }
            } else {
                try {
                    returnValue = returnValue[currentStack]
                } catch (err) {
                    console.error("global varaible dosent have this variable!")
                    return <T><any>""
                }
            }
            /**
             * 檢查目前這個階層是否為陣列且指定要陣列中的的幾個，如果有的話將他移出來
             * ex something[xxx]
            */
            if (ScriptParser.checkIfCurrentStackIsArray(currentStack)) {
                try {
                    const index = parseInt(currentStack.substring(
                        currentStack.lastIndexOf("[") + 1,
                        currentStack.lastIndexOf("]")
                    ));

                    returnValue = returnValue[index];
                } catch (e) {
                    console.error("有錯誤發生在 global variable  中的 scriptParserMiddleware 方法", e)
                }
            }
        }
        return returnValue
    }

    private static checkIfCurrentStackIsArray = (currentStack: string) => {
        return currentStack.includes("[") && currentStack.includes("]")
    }
}