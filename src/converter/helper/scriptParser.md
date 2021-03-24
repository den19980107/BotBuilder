## ScriptParser

### what

scriptParser 這個檔案是為了將腳本內需要存取目前變數內的值讀取出來的工具

ex:

``` json
    {
        payload: {  
            "statusCode": 200,
            "responseData": "#DATA.fetchResult" 
        }
    }
```

腳本中的 `responseData` 是需要從 global varaible 讀取 `fetchResult` 的這個欄位

### how

透過字串中是否存在關鍵字 `#DATA` 來決定是否要讀取變數

* **scriptParserMiddleware** 

    透過這個 middleware 判斷字串是否需要替換成 global variable 中的變數

    判斷流程:

    **範例字串:#DATA.some.thing[1].blabla**

    1. 清掉關鍵字 => `some.thing[1].blabla`
    2. 將所有層級分割出來放到陣列中 => `[some,thing[1],blabla]`
    3. loop 每一個層級 如果為第一層 從 global variable 中讀取
    4. 每一層中檢查目前這層是否為陣列 ex `thing[1]` 如果是 將目前這層移出

* **checkIfCurrentStackIsArray**

    檢查目前這層是否為陣列的工具函式