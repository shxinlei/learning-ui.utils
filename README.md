[TOC]


#### 安装

```powershell
npm i @learning-ui/utils --save
```


> <div style="color:green">增加 ObjectUtils ArrayUtils </div>

#### 详情
  
1. ObjectUtils.isEqual() || ArrayUtils.isEqual() 判断数据是否相等
2. uuid 生成对应位数的uuid
3. text 用于获取文字的高度和宽度
4. uploadFileMd5 多个文件上传前获取每个文件的md5 值
5. scrollHandel 滚动到最下方激活事件
6. ArrayUtils.arrayMove() 根据数组下标移动到对应的位置
7. eventManager 事件总线
8. download 下载
9. ArrayUtils.unique() 数组去重
10. formDeepClone 深度拷贝数据
11. formatTime 将时间戳转换为 年月日时分秒 



##### ObjectUtils.isEqual() || ArrayUtils.isEqual()

```javascript
import { ObjectUtils } from "@learning-ui/utils";

// a 和 b 可以使任意类型
console.log(ObjectUtils.isEqual(a , b) , ArrayUtils.isEqual(a, b));
```

##### uuid(number)

```javascript
import { uuid } from "@learning-ui/utils";

console.log(uuid(16)); //3faa399e94e27fc1
```

import { text } from "@learning-ui/utils";

const App = () => {

  const divRef = React.useRef(null);

  console.log(
    text({
      fontSize: "12px",
      text: "错误啊啊啊啊啊",
      ref: divRef.current || undefined,
  	})
  ); // {width: 84, height: 17}
  

  return (
    <div ref={divRef}>
      
    </div>
  );
};
```

##### uploadFileMd5({	files,  onprogress? , chunkSize?   })

> files 文件集合
>
> onprogress:  加密进度 （current, total, filesLength, currentLength , totalProgress） => {}
>
> ​	current: 当前分割文件的进度
>
> ​     total: 当前分割文件的总数
>
> ​     filesLength: 需要分割文件的个数
>
> ​    currentLength: 正在分割第几个文件
>
> ​    totalProgress: 每个文件的分割进度 
>
> chunkSize?: 分割大小 默认 1024 * 1024

------

```javascript
import { uploadFileMd5 } from "@learning-ui/utils";

const App = () => {
  return (
    <div>
      <input type='file' multiple onChange={(e) => { 
          if(e.target.files && e.target.files.length > 0){
            uploadFileMd5({
              files: e.target.files as unknown as File[],
              onprogress: (current: number, total: number, filesLength: number, currentLength: number , totalProgress: any) => {
                console.log(current , total , filesLength,currentLength , totalProgress);
              },
              chunkSize: 1024 * 1024, // byte
            }).then(res => {
              console.log(res); // MD5
            })
          }
      }} />
    </div>
  );
};
```

##### scrollHandel(e: UIEvent , () => void)

------

```javascript
import { scrollHandel } from "@learning-ui/utils"

const App = () => {

  return (
    <div style={{ height: "400px", overflow: "auto" }} onScrollCapture={(e) => {
        scrollHandel(e , () => {
            console.log(e , 'e')
        })
    }}>
        <div style={{height: "1200px"}}>
            <div>123</div>
            <div>123</div>
        </div>
    </div>
  );
};
```

##### ArrayUtils.arrayMove(array , from , to)

------

```javascript
import { ArrayUtils } from "@learning-ui/utils"


let arr = [ 1 , 2 , 3, 4, 5];
ArrayUtils.arrayMove(arr , 2 , 4) //[1, 2, 4, 5, 3]
```

##### ArrayUtils.unique(arr , key?:)

------

```javascript
import { ArrayUtils } from "@learning-ui/utils"

let arr = [ 1 , 2 , 3, 4, 5 , 4 , 5];
ArrayUtils.unique(arr) //[1, 2, 3, 4, 5]

let arr = [ {name: "a"} , {name: "b"} ,{name: "a"}];
ArrayUtils.unique(arr) //[{name: "a"} , {name: "b"}]

```

##### download

------

```javascript
import { download } from "@learning-ui/utils"

download({ 
  url,  // 地址
  method='GET', 
  name, // 名称
  progress,  // 下载进度
  onClose  // 通过 xhr.abort() 关闭下载 // (xhr) => {}
})
```

##### formatTime(time , keys)
------
```javascript
import {formatTime} from "@learning-ui/utils"
formatTime(1635754317815, ["/", ":"]); // "2021/11/01 16:11:57"

```

#### 事件总线

##### eventManager

------

```javascript
import { eventManager } from "@learning-ui/utils";

eventManager.on("click" , (content) => {
      console.log(content); // Math.random()
}) // 注册 click 事件

eventManager.once("utils" , (content) => {
      console.log(content); // Math.random()
}) // 注册 utils 单次 事件

eventManager.emit("click" , Math.random()); // 激活事件
eventManager.emitOnce("utils" , Math.random()); // 只激活一次 utils 事件


eventManager.off("utils" , () => {}); // 移除 utils 事件
eventManager.off("click" , eventManager.events["click"][0]); // 移除 总事件中click 事件 第一个事件


eventManager.back("click"); // 回退为上一次 click 事件 (废弃)
```
