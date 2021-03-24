## NodePool

### what

NodePool 這個檔案是用來存放已建立完成的節點,並提供其他節點呼叫下一個節點

### how

在一個流程中 每個節點都可以透過 `get`,`set` 這兩個方法來取得 NodePool 中的 `pool` 資料

* **pool** 

    透過 key value 的方式存放節點


* **get**
    
    透過 key 取得 store 中的節點

* **run**

    透過 key 來判斷要執行哪一個節點的 `run` 方法

* **set**

    幫節點定義一個 key,傳入 key,node 即可將節點存在 pool 中
