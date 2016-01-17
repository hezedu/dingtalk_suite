# dingtalk suite
钉钉套件主动调用**API**, 自带**cache**。

回调server API见:[dingtalk_suite_callback](https://github.com/hezedu/dingtalk_suite_callback)
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
      //ticket从 dingtalk_suite_callback 处获得
      fs.readFile(this.suiteid + 'ticket.txt',function(err, data){
        if(err){
            return callback(err);
        }
        data = JSON.parse(data.toString());
        callback(null, data);
      });
    },
    
    getToken: function(callback){
      //从数据库中取出Token，返回的data样式为：{value: 'xxxxxxx', expires:1452735301543}
      fs.readFile(this.suiteid + 'token.txt',function(err, data){
        if(err){
            return callback(err);
        }
        data = JSON.parse(data.toString());
        callback(null, data);
      });
    },
    
    saveToken: function(data, callback){
      //存储Token到数据库中，data样式为：{value: 'xxxxxxx', expires:1452735301543//过期时间}
      fs.writeFile(this.suiteid + 'token.txt',JSON.stringify(data), callback);
    }
  }
var api = new dd_talk(conf);
```
___注___:本项目自带cache, token的过期时间默认为1小时59分50秒(防止网络延迟，故比规定2小时少了10秒)。
可以在`conf.token_expires_in`更改（不可大于2小时）。
##方法
####getPermanentCode(tmp_auth_code, callback)
获取企业号永久授权码,tmp_auth_code字符串，由 [dingtalk_suite_callback](https://github.com/hezedu/dingtalk_suite_callback) 处获得。
####getCorpToken(auth_corpid, permanent_code, callback)
获取企业号Token,auth_corpid和permanent_code由上面接口获得。

####getAuthInfo(auth_corpid, permanent_code, callback) 
获取企业号信息
####getAgent(agentid, auth_corpid, permanent_code, callback) 
获取企业号应用
####activateSuite(auth_corpid, permanent_code, callback) 
激活授权套件
####setCorpIpwhitelist(auth_corpid, ip_whitelist, callback)
ISV为授权方的企业单独设置IP白名单,ip_whitelist为数组格式：["1.2.3.4","5.6.*.*"]

##钉钉文档
http://ddtalk.github.io/dingTalkDoc/?spm=a3140.7785475.0.0.p5bAUd#1-isv接口调用整体流程




