import FlowShareVariable from '../../../src/converter/helper/flowShareVariable';
import scriptParser from '../../../src/converter/helper/scriptParser';

test(`
replaceExpressionWithMiddleware
input: xxx \${xxx} xxx \${xxx} xxx
middleware: string => "ooo"
output: xxx ooo xxx ooo xxx
`, () => {
    const input = "xxx \${xxx} xxx \${xxx} xxx";
    const result = scriptParser.replaceExpressionWithMiddleware(input, "${", "}", (string: string) => {
        return "ooo"
    })

    expect(result).toBe("xxx ooo xxx ooo xxx")
})


test(`
replaceByFlowShareVaraible
replace string to flowshare variable's value
`, () => {
    const flowShareVariable = new FlowShareVariable();
    flowShareVariable.set("Data", [{ value: 1 }, { value: 2 }, { something: { else: "qweqwe" } }])
    const result1 = scriptParser.replaceByFlowShareVaraible("Data[0].value", flowShareVariable);
    expect(result1).toBe(1);
    const result2 = scriptParser.replaceByFlowShareVaraible("Data[1].value", flowShareVariable);
    expect(result2).toBe(2);
    const result3 = scriptParser.replaceByFlowShareVaraible("Data[2].something.else", flowShareVariable);
    expect(result3).toBe("qweqwe");
})

test(`
internalMethodParserMiddleware
檢查字串是否有被內建 function 包住 like int()、string()、bool() ... 並轉換
`, () => {
    const flowShareVariable = new FlowShareVariable();
    flowShareVariable.set("DATA", { value: '1234', bool: "true", string: 1234, length: "vjaoi jeri joreai" });
    const r1 = scriptParser.internalMethodParserMiddleware('int(DATA.value)', flowShareVariable);
    expect(r1).toBe(1234)
    const r2 = scriptParser.internalMethodParserMiddleware('string(DATA.string)', flowShareVariable);
    expect(r2).toBe("1234")
    const r3 = scriptParser.internalMethodParserMiddleware('bool(DATA.bool)', flowShareVariable);
    expect(r3).toBe(true)
    const r4 = scriptParser.internalMethodParserMiddleware('length(DATA.length)', flowShareVariable);
    expect(r4).toBe(17)
    const r5 = scriptParser.internalMethodParserMiddleware('JSON.stringify(DATA)', flowShareVariable);
    expect(r5).toBe("{\"value\":\"1234\",\"bool\":\"true\",\"string\":1234,\"length\":\"vjaoi jeri joreai\"}")
    const r6 = scriptParser.internalMethodParserMiddleware('int(string(DATA.string))', flowShareVariable);
    expect(r6).toBe(1234)
})

test(`
scriptParserMiddleware
find a substring in original string and replace it to flow share varaible value
original string = "{"message":"\${DATA.value} is greater than \${myValue}"}"
`, () => {
    const flowShareVariable = new FlowShareVariable();
    flowShareVariable.set("DATA", { value: 10 });
    flowShareVariable.set("myValue", 5);
    const originalString = `{"message":"\${DATA.value} is greater than \${myValue}"}`
    const result = scriptParser.scriptParserMiddleware(originalString, flowShareVariable);
    expect(result).toBe(`{"message":"10 is greater than 5"}`)
})


test(`
scriptParserMiddleware
find a substring in original string and replace it to flow share varaible value
if subsctring contain like int(somthing) cast the value to number
original string = "\${int(DATA.value)}"
`, () => {
    const flowShareVariable = new FlowShareVariable();
    flowShareVariable.set("DATA", { value: 10 });
    const originalString = `\${int(DATA.value)}`
    const result = scriptParser.scriptParserMiddleware(originalString, flowShareVariable);
    expect(result).toBe(10)
})



test(`
scriptParserMiddleware
測試多個 internal method 有沒有用
ex string(int(xxx))
`, () => {
    const flowShareVariable = new FlowShareVariable();
    flowShareVariable.set("DATA", { value: "10" });
    const originalString = `"{"message":\${int(DATA.value)}}"`
    const result = scriptParser.scriptParserMiddleware(originalString, flowShareVariable);
    expect(result).toBe(`\"{"message":10}\"`)
})
