import FlowShareVariable from "./flowShareVariable";
import serverConfig from '../../../config/server.json'
import { internalMethods } from 'botbuilder-share'

const { castToBool, castToNumber, castToString, JsonStringify, getLength } = internalMethods


/**
 * expression: 代表在字串中，有被 "${" 和 "}" 包起來的地方
 * internal method: 代表字串中，有被如 "int(" ")" 、"string(" ")" 包起來的部分
 */

export default class ScriptParser {

    /**
    * 檢查使用者的字串中是否有備 "${" 和 "}" 包含的值 
    * 如果有的話需要將該字串替換成目前變數中的值
    * 進來的資料為 payload 的其中一個 key:value
    * EX:
    * "{"message":${DATA.value}}" => "{"message":"somting ..."}" 之類的
    * 也需要檢查這個值有沒有被內建轉型方法轉掉
    * EX:
    * "{"message":${int(DATA.value)}}" => "{"message":10}" 之類的
    */

    static scriptParserMiddleware(input: any, flowShareVariable: FlowShareVariable) {
        if (!input) return null

        let string;
        if (typeof input === 'object') {
            string = JSON.stringify(input)
        } else {
            string = String(input)
        }
        const startSpliter = serverConfig.SCRIPT_PARSER.START_SPLITER;
        const endSpliter = serverConfig.SCRIPT_PARSER.END_SPLITER;

        const result = this.replaceExpressionWithMiddleware(string, startSpliter, endSpliter, (subString: string) => {
            return this.internalMethodParserMiddleware(subString, flowShareVariable)
        })

        return result
    }

    /**
     * 找出字串中的 expression (就是被 "${" "}" 包起來的地方)，並可以傳入一個 middleware 來處理要怎麼轉換這個字串
     * @param string 
     * @param startSpliter 
     * @param endSpliter 
     * @param middleware 
     * @returns 
     */
    static replaceExpressionWithMiddleware(originalString: string, startSpliter: string, endSpliter: string, middleware: (substring: string) => string) {
        let storeStringArr = []
        let haveStartAndEndSpliter = false
        let string = originalString;
        while (true) {
            const startIndex = string.indexOf(startSpliter);
            const endIndex = string.indexOf(endSpliter);

            // step.1 檢查有沒有 startIndex 和 endIndex，如果沒有，把整個自串存到 storeStringArr，並把字串清空跳出迴圈
            if (startIndex === -1 || endIndex === -1) {
                storeStringArr.push(string);
                break;
            } else {
                haveStartAndEndSpliter = true
            }


            // step.2 先把前面的存起來
            // ex: blabla {start}some.thing.else{end} qeqweqwe
            // 會先把 [blabla ] 存到 storeStringArr
            const aheadString = string.substring(0, startIndex);
            storeStringArr.push(aheadString);


            // step.3 找出 startSpliter 和 endSpliter 中間的字，並交給 middleware 處理
            let substring = string.substring(startIndex + startSpliter.length, endIndex);


            const resultString = middleware(substring);

            // step.4 將結果存到 storeStringArr
            storeStringArr.push(resultString);

            // step.5 取 string 從 endIndex + 1 到 string.length 都清掉
            // ex: "ahead string{start}qqeqwe{end}behind string" => "behind string"
            string = string.slice(endIndex + endSpliter.length, string.length);
        }

        // 刪掉陣列裡面為 '' 空 的值
        storeStringArr = storeStringArr.filter(item => item !== '')

        // 把 storeStringArr merge 起來並回傳
        if (storeStringArr.length === 1) {
            return storeStringArr[0]
        } else {
            return storeStringArr.join("")
        }
    }

    static replaceInternalMethodWithMiddleware(string: string, startSpliter: string, endSpliter: string, castFunction: Function, middleware: (substring: string) => string) {
        if (string.startsWith(startSpliter) && string.endsWith(endSpliter)) {
            // 把 startSpliter 和 endSpliter 拿掉，使用 middleware 轉換剩下的值，並看要不要轉型
            const startIndex = string.indexOf(startSpliter);
            const endIndex = string.lastIndexOf(endSpliter);
            const content = string.slice(startIndex + startSpliter.length, endIndex);
            if (castFunction) {
                return castFunction(middleware(content))
            } else {
                return middleware(content)
            }
        } else {
            return string
        }
    }

    // 檢查 "${" "}" 之內的值有沒有包含內建函數
    // ex int(Data.value) => 要處理 int
    static internalMethodParserMiddleware(string: string, flowShareVariable: FlowShareVariable): any {
        // 如果字串中包含任何一種 internal method，就繼續呼叫 internalMethodParserMiddleware 直到沒有時回傳 stringParserMiddleware

        // cast to number
        if (string.startsWith(castToNumber.START_SPLITER) && string.endsWith(castToNumber.END_SPLITER)) {
            const result = this.replaceInternalMethodWithMiddleware(string, castToNumber.START_SPLITER, castToNumber.END_SPLITER, castToNumber.METHOD, (subSubString: string) => {
                return this.internalMethodParserMiddleware(subSubString, flowShareVariable)
            })
            return result
        }

        // cast to Bool
        if (string.startsWith(castToBool.START_SPLITER) && string.endsWith(castToBool.END_SPLITER)) {
            const result = this.replaceInternalMethodWithMiddleware(string, castToBool.START_SPLITER, castToBool.END_SPLITER, castToBool.METHOD, (subSubString: string) => {
                return this.internalMethodParserMiddleware(subSubString, flowShareVariable)
            })
            return result
        }

        // cast to string
        if (string.startsWith(castToString.START_SPLITER) && string.endsWith(castToString.END_SPLITER)) {
            const result = this.replaceInternalMethodWithMiddleware(string, castToString.START_SPLITER, castToString.END_SPLITER, castToString.METHOD, (subSubString: string) => {
                return this.internalMethodParserMiddleware(subSubString, flowShareVariable)
            })
            return result
        }

        // getLength        
        if (string.startsWith(getLength.START_SPLITER) && string.endsWith(getLength.END_SPLITER)) {
            const result = this.replaceInternalMethodWithMiddleware(string, getLength.START_SPLITER, getLength.END_SPLITER, getLength.METHOD, (subSubString: string) => {
                return this.internalMethodParserMiddleware(subSubString, flowShareVariable)
            })
            return result
        }

        // json stringify
        if (string.startsWith(JsonStringify.START_SPLITER) && string.endsWith(JsonStringify.END_SPLITER)) {
            const result = this.replaceInternalMethodWithMiddleware(string, JsonStringify.START_SPLITER, JsonStringify.END_SPLITER, JsonStringify.METHOD, (subSubString: string) => {
                return this.internalMethodParserMiddleware(subSubString, flowShareVariable)
            })
            return result
        }

        // 
        const result = this.replaceByFlowShareVaraible(string, flowShareVariable);
        return result
    }

    static replaceByFlowShareVaraible(string: string, flowShareVariable: FlowShareVariable) {
        // 取出所有層,每一層我取名叫做 "stack"
        // ex {message:#FLOW_SHARE_VARIABLE.some.thing[0].blabla# 123} ["some","thing[0]","blabla"]
        // 切分開頭: #FLOW_SHARE_VARIABLE.
        // 切分結尾: <space>
        const stacks = string.split(".");

        let returnValue: any;

        for (let i = 0; i < stacks.length; i++) {
            let currentStack = stacks[i]
            // stack 中的第一層要從 gloal variable 中拿取
            if (i == 0) {
                // 如果第一個 stack 中就是陣列 ex something[1]
                if (this.checkIfCurrentStackIsArray(currentStack)) {
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
                }
            }
            /**
             * 檢查目前這個階層是否為陣列且指定要陣列中的的幾個，如果有的話將他移出來
             * ex something[xxx]
            */
            if (this.checkIfCurrentStackIsArray(currentStack)) {
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

    static checkIfCurrentStackIsArray(currentStack: string) {
        return currentStack.includes("[") && currentStack.includes("]")
    }
}