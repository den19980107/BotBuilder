# BotBuilder



## Intro：

BotBuilder 由三個專案組成

[BotBuilder](https://github.com/den19980107/BotBuilder): botbuilder 的後端，由 node.js express.js mongodb 組成

[botbuilder-ui](https://github.com/den19980107/botbuilder-ui): botbuilder 的前端，由 react 組成

[Botbuilder.Share](https://github.com/den19980107/Botbuilder.Share): 用來共享前後端的 typing



## 介紹：

此專案是一個流程設計軟體，目的是讓使用者可以在不需要會寫程式的情況下，透過拖拉節點的方式將所需要的功能以流程圖的方式組合出來。

## 節點類別：

* event：事件類型節點，為一個流程中的第一個節點，如 `排程`、`建立 API`等節點都是事件節點
* process：處理類型節點，負責各種計算、資料處理、呼叫 API 等都是處理節點
* condition：條件判斷節點，負責處理流程的條件判斷
* result：結束節點，為一個流程的結束，如 `http response` 節點

## 節點（node）：

> ### 屬性：
>
> 每一個節點都會包含以下基本的幾個屬性
>
> * id：節點的 id
> * name：節點的名稱
> * payload：節點內的資料，例如排程節點會有 `開始日期`、`結束日期`、`時間` ... 等等，根據不同節點需要的資料不同，payload 內的資料也會不同
> * type：節點的類別，如上面節點類別介紹的
> * next_node_id：接著此節點後執行的節點 id

>### 生命週期方法：
>
>一個節點目前只會有三個生命週期
>
>* constructor：在 bot builder 中，節點的處存方式是以 json 字串的方式存放於資料庫中，在系統執行時，會將這些節點用 json parser 出來變成  json 物件，並透過 `Node Convertor` 將 json 物件轉換成腳本，在轉換成流程，最換轉換成節點到不同節點的 constructor 中，將這個節點 new 出來，這些 json 物件就是包含上面所說的節點屬性，透過判斷 `type` 決定要將這包 json 傳給哪個節點的 constructor 來建立
>
>* run：此節點執行時要做什麼事，在 `run` 中，每個節點會將該節點的 payload 中的資料取出，並且根據這些資料執行此節點的功能，如 webhook 節點會在 run 中，將 payload 中的 route 取出，並且產生出 endpoint
>* remove：此節點從 `節點池` 中被移除時要做什麼事，一樣以 webhook 節點為例，在移除時會需要將該 endpoint 移除

## 節點池（node pool）：

>在 `Node Convertor` 將 json 傳入不同節點的 constructor 來 new 出節點實體時，會將這些實體存放在節點池中
>
>節點池的存放方式是以 `key value` 的方式存放，key 會存放 `節點 id`，value 會存放 new 出來的 `節點實體`
>
>node pool 中有幾個屬性：
>
>* pool：以 `key value` 的方式存放節點實體
>* get：傳入節點 id，會回傳該節點實體
>* set：傳入節點 id 與節點實體，會將 id 與實體存在 pool 中，key 為 id，value 為實體
>* run：傳入節點 id，會取出 pool 中的節點實體，並呼叫該實體的 `run` 方法

## 流程（Flow）：

>將數個節點串連起來就是一個流程，每個流程應該都要以 `event`節點為開頭，`result` 節點為結束

## 流程共享變數（Flow Share Varaible）：

>在流程中每個節點可能都會有需要儲存資料，或是取得其他節點處存的資料，這個時候流程共享變數就派上用場，
>
>流程共享變數內是以 `key value` 的方式來存放變數資料
>
>屬性如下：
>
>* store：以 key value 的方式存放資料
>* get：傳入 key 來取得 value
>* set：傳入 key 和 value 來將這組 key value pair 存到 store 中
>
>在執行一個流程之前，會先建立一個流程共享變數
>
>並將這個流程共享變數傳到初始節點的 `run` 方法中，初始節點在 `run` 方法中如果有需要存放或讀取資料，可以呼叫 get set 方法，之後等到初始節點執行完畢，要呼叫下一個節點的 run 方法時，再把這個流程共享變數傳下去，這樣整個流程中的節點就都可以取得之前見點所存放的變數資料了
>
>![截圖 2021-05-02 上午12.29.42](https://tva1.sinaimg.cn/large/008i3skNgy1gq3e7rxitsj31780c6ac0.jpg)

## Script Parser：

>上面有提到在一個流程中會有流程共享變數，那我們取得或設定流程共享變數內的值的方法就是透過在 payload 中加入
>
>`#FLOW_SHARE_VARIABLE.什麼東西`，在每個節點 run 之前，都要透過 script parser 來檢查 payload 內欄位的值是否有包含 
>
>`#FLOW_SHARE_VARIABLE`，如果有，假設是`#FLOW_SHARE_VARIABLE.DATA.id`，那 script parser 就會去 flow share variable 中 get `DATA` 這個值，並將 `DATA`.`id` 替換掉原本這個欄位得值，大致向下方的圖（抱歉我真的很不會解釋🥲
>
>![截圖 2021-05-02 上午1.08.35](https://tva1.sinaimg.cn/large/008i3skNgy1gq3fc7ybilj315u0b275r.jpg)

## Bot 腳本（Script）：

>一個 script 包含多個 flow

## Node Convertor：

>Node Convertor 是整個系統的核心，由於 db 中存放的流程資料為 [react flow](https://reactflow.dev/) 的原始資料（方便前端顯示），所以在系統啟動時，需要將原始資料轉換為上面的那些`節點`、`流程 `、`腳本` 等
>
>整個流程大致如下，原始資訊中存放的內容會像圖中顯示的那樣，顯示有幾個 `節點(node)`，節點內有什麼資料，然後會有不同 `邊(edge)` ，這邊的節點跟邊都是 react flow 中所定義的，跟上面的那些不要混再一起
>
>總之就是需要將 react flow 的原始資料轉換成我們這個系統看的懂的資料格式，並將節點 new 出來塞到 node pool 中
>
>![截圖 2021-05-02 上午12.52.42](https://tva1.sinaimg.cn/large/008i3skNgy1gq3evp4idbj313i0eiaci.jpg)





