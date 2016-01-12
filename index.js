var agent = require('superagent');
var base_url = 'https://oapi.dingtalk.com/service';
var ticket_expires_in = 1000 * 60 * 20 //20分钟
var token_expires_in = 1000 * 60 * 60 * 2 - 10000 //1小时59分50秒.防止网络延迟

var config = {
  token: 'saffqwsfsfasfsfasf',
  encodingAESKey: 'er7dufdhn1vw5rm2n30vxkrz11ppt4zciz52t5dj86z',
  suiteid: 'suitexpiygdnz51hsbbhj'
}

var Api = function(conf, getTicket, getToken, saveToken) {
  this.suite_key = conf.suiteid;
  this.suite_secret = conf.encodingAESKey;
  this.ticket_expires_in = conf.ticket_expires_in || ticket_expires_in;
  this.token_expires_in = conf.token_expires_in || token_expires_in;

  this.getTicket = getTicket;
  this.getToken = getToken;
  this.saveToken = saveToken;
  this.ticket_cache = {
    expires_in: 0,
    value: null
  };
  this.token_cache = {
    expires_in: 0,
    value: null
  };
}

Api.prototype.getLatestTicket = function(callback) {
  var now = Date.now();
  if (this.ticket_cache.expires_in + this.ticket_expires_in <= now) {
    this.getTicket(callback);
  } else {
    callback(null, this.ticket_cache);
  }
}

Api.prototype.getLatestToken = function(callback) {
  var self = this;
  var now = Date.now();
  if (this.token_cache.expires_in + this.token_expires_in <= now) {

    self.getLatestTicket(function(err, ticket) {
      if (err) {
        return callback(err);
      }else{
        callback
      }
    });
  } else {
    callback(null, this.token_cache);
  }



  agent.post(base_url + '/get_suite_token')
    .send({
      suite_key: this.suite_key
    })
}

Api.prototype.get_access_token = function(callback) {
  this.getLatestTicket(function(err, ticket){
    agent.post(base_url + '/get_suite_token')
      .send({
        suite_key: this.suite_key,
        suite_secret: this.suite_secret,
        suite_ticket : this.suite_ticket
      }).end(callback);
  });
};