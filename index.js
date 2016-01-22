var agent = require('superagent');
var util = require('./util');

var BASE_URL = 'https://oapi.dingtalk.com/service';
var SSO_BASE_URL = 'https://oapi.dingtalk.com';
var TICKET_EXPIRES_IN = 1000 * 60 * 20 //20分钟
var TOKEN_EXPIRES_IN = 1000 * 60 * 60 * 2 - 10000 //1小时59分50秒.防止网络延迟



var Api = function(conf) {
  this.suite_key = conf.suiteid;
  this.suite_secret = conf.secret;
  this.SSOSecret = conf.SSOSecret;
  this.corpid = conf.corpid;
  this.ticket_expires_in = TICKET_EXPIRES_IN;
  this.token_expires_in = conf.token_expires_in || TOKEN_EXPIRES_IN;

  this.getTicket = conf.getTicket;
  this.getToken = conf.getToken;
  this.saveToken = conf.saveToken;

  this.ticket_cache = {
    expires: 0,
    value: null
  };
  this.token_cache = null;

}

Api.prototype.getSSOToken = function(callback) {
  var self = this;
  console.log('corpid', self.corpid);
  console.log('corpsecret', self.SSOSecret);
  agent.get(SSO_BASE_URL + '/sso/gettoken')
    .query({
      corpid: self.corpid,
      corpsecret: self.SSOSecret
    })
    .end(util.wrapper(callback));
};

//登录
Api.prototype.getSSOUserInfoByCode = function(code, callback) {
  var self = this;
  self.getSSOToken(function(err, token) {
    if (err) {
      return callback(err);
    };
    console.log('SSO token', token);
    agent.get(SSO_BASE_URL + '/sso/getuserinfo')
      .query({
        code: code,
        access_token: token.access_token
      })
      .end(util.wrapper(callback));
  });
};

Api.prototype.getLatestTicket = function(callback) {
  var now = Date.now();
  if (this.ticket_cache.expires  <= now) {
    this.getTicket(callback);
  } else {
    callback(null, this.ticket_cache);
  }
}

Api.prototype._get_access_token = function(callback) {
  var self = this;
  this.getLatestTicket(function(err, ticket) {

    var data = {
      suite_key: self.suite_key,
      suite_secret: self.suite_secret,
      suite_ticket: ticket.value
    };

    agent.post(BASE_URL + '/get_suite_token')
      .send(data).end(util.wrapper(callback));
  });
};

Api.prototype.getLatestToken = function(callback) {
  var self = this;

  if (!self.token_cache) {
    self.getToken(function(err, token) {
      if (err) {
        return callback(err);
      } else {
        self.token_cache = token;
        self.getLatestToken(callback);
      }
    });
  } else {
    var now = Date.now();
    if (self.token_cache.expires  <= now) {
      self._get_access_token(function(err, token) {
        if (err) {
          return callback(err);
        } else {
          token = {
            value: token.suite_access_token,
            expires: now + self.token_expires_in
          }
          self.saveToken(token, function(err) {
            if (err) {
              return callback(err);
            }
            self.token_cache = token;
            callback(null, token);
          });
        }
      });
    } else {
      callback(null, this.token_cache);
    }
  }
}

Api.prototype.getPermanentCode = function(tmp_auth_code, callback) {
  var self = this;
  self.getLatestToken(function(err, token){

    if(err){
      return callback(err);
    };

    agent.post(BASE_URL + '/get_permanent_code')
      .query({suite_access_token:token.value})
      .send({tmp_auth_code : tmp_auth_code})
      .end(util.wrapper(callback));
  });

}

Api.prototype.getCorpToken = function(auth_corpid, permanent_code, callback) {
  var self = this;
  self.getLatestToken(function(err, token){

    if(err){
      return callback(err);
    };

    agent.post(BASE_URL + '/get_corp_token')
      .query({suite_access_token:token.value})
      .send({auth_corpid : auth_corpid, permanent_code: permanent_code})
      .end(util.wrapper(callback));
  });
}

Api.prototype.getAuthInfo = function(auth_corpid, permanent_code, callback) {
  var self = this;
  self.getLatestToken(function(err, token){

    if(err){
      return callback(err);
    };
    agent.post(BASE_URL + '/get_auth_info')
      .query({suite_access_token:token.value})
      .send({suite_key: self.suite_key, auth_corpid : auth_corpid, permanent_code: permanent_code})
      .end(util.wrapper(callback));
  });
}

Api.prototype.getAgent = function(agentid, auth_corpid, permanent_code, callback) {
  var self = this;
  self.getLatestToken(function(err, token){

    if(err){
      return callback(err);
    };
    agent.post(BASE_URL + '/get_agent')
      .query({suite_access_token:token.value})
      .send({suite_key: self.suite_key, auth_corpid : auth_corpid, permanent_code: permanent_code, agentid: agentid})
      .end(util.wrapper(callback));
  });
}

Api.prototype.activateSuite = function(auth_corpid, permanent_code, callback) {
  var self = this;
  self.getLatestToken(function(err, token){

    if(err){
      return callback(err);
    };
    agent.post(BASE_URL + '/activate_suite')
      .query({suite_access_token:token.value})
      .send({suite_key: self.suite_key, auth_corpid : auth_corpid, permanent_code: permanent_code})
      .end(util.wrapper(callback));
  });
}

Api.prototype.setCorpIpwhitelist = function(auth_corpid, ip_whitelist, callback) {
  var self = this;
  self.getLatestToken(function(err, token){

    if(err){
      return callback(err);
    };
    agent.post(BASE_URL + '/set_corp_ipwhitelist')
      .query({suite_access_token:token.value})
      .send({suite_key: self.suite_key, auth_corpid : auth_corpid, ip_whitelist: permanent_code})
      .end(util.wrapper(callback));
  });
}

module.exports = Api;