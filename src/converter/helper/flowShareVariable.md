## FlowShareVariable

### what

FlowShareVariable 這個檔案是為了解決在一個 Flow 中不同節點所處存的變數需要共享的問題

#### concept

![IMG_C944247F2F6B-1](https://tva1.sinaimg.cn/large/e6c9d24egy1gom4mynrr8j21c20u0k1y.jpg)

### how

在一個流程中 每個節點都可以透過 `get`,`set` 這兩個方法來取得 FlowShareVariable 中的 `store` 資料

* **store** 

    透過 key value 的方式存放變數


* **get**
    
    透過 key 取得 store 中的資料

* **set**

    幫資料定義一個 key,傳入 key,value 即可將資料存在 store 中
