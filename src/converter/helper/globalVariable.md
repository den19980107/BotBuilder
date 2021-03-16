## GlobalVariable

### what

globalvariable 這個檔案是為了解決不同節點所處存的變數需要共享的問題

### how

在一個流程中 每個節點都可以透過 `get`,`set` 這兩個方法來取得 globalVariable 中的 `store` 資料

* **store** 

    透過 key value 的方式存放變數


* **get**
    
    透過 key 取得 store 中的資料

* **set**

    幫資料定義一個 key,傳入 key,value 即可將資料存在 store 中
