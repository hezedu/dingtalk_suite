# dingtalk_suite(未完成)
钉钉套件主动调用api, 自带缓存。
##安装 
`npm install dingtalk_suite`
##示例
构造函数：
```js
var dd_talk = require('dingtalk_suite');
var conf = {
    suiteid: 'suitexpiygdnz51hsbbhj',
    secret: 'C1oXyeJUgH_QXEHYJS4-Um-zxfv_yGSpTs3Yq6un6UV_zAlEpt-6np3fXskv5dGs',
    getTicket: function(callback){ 
      //从数据库中取出Tikcet，返回的data样式为：{value: 'xxxxxxx', expires:1452735301543}
      callback(null, data);
    },
    getToken: function(callback){
      //从数据库中取出Token，返回的data样式为：{value: 'xxxxxxx', expires:1452735301543}
      callback(null, data);
    },
    saveToken: function(data, callback){
      //存储Token到数据库中，data样式为：{value: 'xxxxxxx', expires:1452735301543//过期时间}
      callback(null);
    }
  }
var api = new dd_talk(conf);
```
##方法
获取企业号永久授权码：

`api.getPermanentCode(tmp_auth_code, callback)` 


